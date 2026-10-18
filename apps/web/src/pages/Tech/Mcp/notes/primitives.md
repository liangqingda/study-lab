## 1. 三类能力按交互语义区分

Tools 表达可调用操作，Resources 表达可读取上下文，Prompts 表达可复用提示模板。它们可能都返回文本，但用途和发现/调用方式不同。常见交互模式中模型选择工具、应用选择资源、用户选择提示；这些是设计引导，不是协议替你强制执行全部界面策略。

基线 2026-07-28；请求均需适用的 params._meta。以下 JSON 为方法参数或结果片段时会明确说明，不把省略元数据的片段当完整线上请求。

## 2. 三种最小契约

| 能力     | 发现 / 使用                               | 最小实例           | 结果                         |
| -------- | ----------------------------------------- | ------------------ | ---------------------------- |
| Tool     | tools/list / tools/call                   | search_docs(query) | 检索结果和执行状态           |
| Resource | resources/list、模板发现 / resources/read | doc://guide/cache  | URI 对应的文本或二进制表示   |
| Prompt   | prompts/list / prompts/get                | summarize(topic)   | 可用于后续模型交互的消息模板 |

资源 URI 不一定是可由浏览器直接打开的 HTTPS 地址；它是协议中可识别的资源标识。资源模板带参数化 URI，必须验证参数和权限，不能把 URI 拼接直接变成任意文件读取。

## 3. 完整可运行的契约实验

先预测：同样包含“cache”文本的三种能力，返回结构和权限边界是否相同？保存为 `primitives.mjs`：

```js
import assert from 'node:assert/strict';
const tools = [
  {
    name: 'search_docs',
    description: '只读检索可见文档',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', minLength: 1 } },
      required: ['query'],
      additionalProperties: false,
    },
  },
];
const documents = new Map([['doc://guide/cache', '缓存保存可复用的表示。']]);
function search(query) {
  if (typeof query !== 'string' || !query.trim())
    throw new Error('invalid query');
  return {
    resultType: 'complete',
    content: [
      { type: 'text', text: JSON.stringify([{ uri: 'doc://guide/cache' }]) },
    ],
  };
}
function read(uri) {
  if (!documents.has(uri)) throw new Error('unknown or forbidden URI');
  return {
    resultType: 'complete',
    contents: [{ uri, mimeType: 'text/plain', text: documents.get(uri) }],
  };
}
function prompt(topic) {
  if (typeof topic !== 'string' || topic.length > 80)
    throw new Error('invalid topic');
  return {
    resultType: 'complete',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `请围绕给定主题总结事实，并区分证据与推断：${topic}`,
        },
      },
    ],
  };
}
assert.equal(tools[0].name, 'search_docs');
assert.equal(search('cache').content[0].type, 'text');
assert.equal(read('doc://guide/cache').contents[0].mimeType, 'text/plain');
assert.equal(prompt('cache').messages[0].role, 'user');
assert.throws(() => read('file:///private/secret'));
console.log('tool, resource and prompt contracts verified');
```

运行 `node primitives.mjs`。这是三个能力处理函数的本地实验，不是完整 MCP server；完整实现还要经过协议 schema、分页、错误和传输验证。示例的 JSON Schema 描述输入，但处理器仍显式检查输入，说明“发布 schema”不等于运行时一定自动校验。

## 4. 从发现到使用

客户端读取可用能力描述后，还需按用户权限过滤；工具列表里存在某项，不代表任意用户有权调用。分页 cursor 需要正确处理，不能永远只读第一页。结果中的结构化数据、文本说明与附件必须按声明格式消费，不能无条件把所有结果 JSON.parse。

工具执行失败可以通过相应结果的失败状态表达，也可能有协议层错误；资源不存在和提示参数错误的语义与工具业务失败不同，见后续实现笔记。资源内容和 prompt 模板同样是不可信输入来源，不能自动升级为系统级指令。

## 5. 常见错误与练习

1. 给搜索能力加入返回结果上限，验收说明输入限制、空结果与上游失败三种情况。
2. 给资源读取加用户可见列表，验收即使知道 URI 也不能越权读取。
3. 设计一个报告 prompt，验收模板只组织输入，不在取模板时偷偷发送邮件或修改数据库。

## 6. 资料链接

- [MCP：Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MCP：Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)
- [MCP：Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts)
