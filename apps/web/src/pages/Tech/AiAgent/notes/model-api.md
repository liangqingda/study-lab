## 1. 从一次请求理解大模型

模型调用是后端发起的一次受限外部请求。应用发送指令和消息，读取内容、结束原因与用量，再决定回答用户还是继续处理。模型密钥保留在服务端，浏览器只请求自己的后端。

环境：Node.js 22+。本节以 **2026-10-20 核对的 Anthropic Messages HTTP API** 为一个具体例子；模型名通过环境变量指定，使用账户实际可用的型号。其他厂商的字段、角色和续传方式应单独核对，不能直接互换请求体。真实 API 实验需要网络、有效密钥和费用额度，未在本任务中实际调用。

## 2. 核心术语与可观察含义

| 术语                    | 解释                                             | 例子与结果                                  |
| ----------------------- | ------------------------------------------------ | ------------------------------------------- |
| Token                   | 模型处理文本等内容的计量单元，不等于一个汉字     | 同一句话的字符数不能直接当账单用量          |
| 上下文窗口              | 一次推理可容纳信息的上限，输入输出额度依模型规定 | 历史、工具定义、检索资料都会占空间          |
| 消息角色                | 区分用户输入、模型回答等内容来源                 | Messages 的 system 是独立顶层字段           |
| Sampling（采样）        | 生成时选择后续内容的过程                         | 相同输入的多次输出可能不同                  |
| Stop reason（结束原因） | 本轮为何结束                                     | end_turn、tool_use、max_tokens 要走不同分支 |
| Usage（用量）           | 服务返回的输入输出计数                           | 用于预算和观测；缓存、工具费等需另外核对    |

多轮请求通常要带上必要的历史 user/assistant 消息。请求不是无限记忆；保留在哪里、哪些轮次重新发送，都由具体 API 和应用共同决定。`max_tokens` 是输出上限，不是结果一定完整的承诺。

## 3. 完整实验：服务端发送一次真实请求

先预测：输出被截断时能否直接当完整答案？保存为 `model-api.mjs`，通过本机安全的环境变量管理方式提供 `ANTHROPIC_API_KEY` 和 `ANTHROPIC_MODEL`，再运行 `node model-api.mjs`。不要把密钥写入文件或提交记录。

```js
const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL;
if (!apiKey || !model) throw new Error('missing model configuration');

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  signal: AbortSignal.timeout(30_000),
  body: JSON.stringify({
    model,
    max_tokens: 256,
    system: '用中文简短解释概念；不知道时说明不确定。',
    messages: [{ role: 'user', content: '什么是 HTTP 缓存？' }],
  }),
});
if (!response.ok) throw new Error(`model HTTP ${response.status}`);
const result = await response.json();
if (result.stop_reason !== 'end_turn') {
  throw new Error(`unfinished response: ${result.stop_reason}`);
}
const text = result.content
  .filter((block) => block.type === 'text')
  .map((block) => block.text)
  .join('\n');
if (!text.trim()) throw new Error('empty response');
console.log(text);
console.log({ model: result.model, usage: result.usage });
```

预期：有效配置下得到缓存解释以及用量对象，文字和 Token 数不固定；缺配置时得到 `missing model configuration`，非成功 HTTP 响应得到对应状态码，超时则 fetch 拒绝。本例主动拒绝所有非 end_turn 结果，适合普通问答；工具型应用必须另外处理 tool_use。

## 4. 离线实验：结束不等于完成

保存为 `model-status.mjs`，运行 `node model-status.mjs`。这是结束原因的应用分支测试，不模拟模型生成质量：

```js
import assert from 'node:assert/strict';
/**
 * 把 API 的结束原因映射为应用动作。
 */
function classify(reason) {
  if (reason === 'end_turn') return 'check_answer';
  if (reason === 'tool_use') return 'validate_and_execute_tools';
  if (reason === 'max_tokens') return 'incomplete';
  return 'handle_provider_specific_reason';
}
assert.equal(classify('tool_use'), 'validate_and_execute_tools');
assert.equal(classify('max_tokens'), 'incomplete');
assert.equal(classify('end_turn'), 'check_answer');
console.log('tool_use → tools; max_tokens → incomplete; end_turn → check');
```

## 5. 流式响应与界面状态

**Streaming（流式输出）**把生成结果拆成事件逐步发送，降低首段内容的等待感。**SSE** 是文本事件流格式，以空行分隔事件。网络数据块不等于一个完整 SSE 事件或 JSON：要处理跨块、多个事件、UTF-8 解码和结束事件。

模型流 → 后端解析供应商事件 → 转成应用的 text_delta、tool_started、tool_finished、completed、failed 事件 → 前端更新显示。工具参数也可能分段传输，完整接收并通过校验后才允许执行。实际开发优先使用供应商 SDK 的流解析器。

首个字符出现不代表任务完成；记录首段延迟和总耗时两种指标。用户停止生成时，把取消信号传到上游；已完成的外部写入不会因关闭界面自动撤销。

先预测：一个汉字的 UTF-8 字节被拆进不同网络块时，逐块解码是否可靠？保存为 `stream-frames.mjs`，运行 `node stream-frames.mjs`：

```js
import assert from 'node:assert/strict';

/**
 * 解析本实验的 LF 分隔、单行 JSON data 事件；不是供应商完整解析器。
 */
function consume(chunks) {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let buffer = '';
  let text = '';
  let completed = false;
  for (const chunk of chunks) {
    buffer += decoder.decode(chunk, { stream: true });
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (completed) throw new Error('event_after_done');
      const lines = frame.split('\n');
      const event = lines.find((line) => line.startsWith('event: '))?.slice(7);
      const raw = lines.find((line) => line.startsWith('data: '))?.slice(6);
      const data = JSON.parse(raw);
      if (event === 'delta' && typeof data.text === 'string') text += data.text;
      else if (event === 'done') completed = true;
      else throw new Error('invalid_event');
    }
  }
  buffer += decoder.decode();
  if (buffer.trim() || !completed) throw new Error('incomplete_stream');
  return text;
}

const bytes = new TextEncoder().encode(
  'event: delta\ndata: {"text":"你好"}\n\nevent: done\ndata: {}\n\n',
);
assert.equal(consume([bytes]), '你好');
assert.equal(
  consume(Array.from(bytes, (byte) => new Uint8Array([byte]))),
  '你好',
);
assert.throws(() => consume([bytes.slice(0, 12)]), /incomplete_stream/);
console.log(
  'one chunk and byte fragments → 你好; truncated → incomplete_stream',
);
```

预期整块和逐字节输入都得到“你好”，截断则失败。TextDecoder 的流模式保留半截字符，buffer 保留半截事件，while 处理一块中的多个事件。这是应用自定义事件的离线实验：只支持 LF、每事件一行 JSON data，不覆盖 SSE 的全部语法（如 CRLF、多行 data、注释和重连 ID），也不是 Messages API 的事件名。接入真实模型时使用对应 SDK，并处理供应商规定的增量与终止事件。

## 6. 错误与边界

错误做法是每收到一个网络块就 `JSON.parse(chunk)`，半截 JSON 会解析失败。修正是按协议累计并拆出完整事件，或使用已核对版本的 SDK。低采样随机性也不能保证完全可复现，更不能代替契约校验。

401/403 优先检查凭据与权限；429 按服务策略和 Retry-After 做有限退避；5xx/网络故障可以评估重试。不要把所有错误都无限重发。费用估算要按供应商当前定价处理输入、输出、缓存及工具费用，本路线不固定价格。

## 7. 练习与验收

1. 加入第二轮追问。验收：请求包含需要的上一轮消息，日志不含密钥。
2. 给 UI 定义 waiting、streaming、completed、failed、cancelled。验收：截断与网络中断不会显示“任务完成”。
3. 对一次请求记录首段延迟、总耗时和 usage。验收：区分真实测量与预估，失败也有状态记录。

## 8. 资料链接

- [Anthropic：Create a Message](https://platform.claude.com/docs/en/api/messages/create)
- [MDN：SSE 事件格式与连接行为](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Node.js：fetch 与取消信号](https://nodejs.org/api/globals.html)
