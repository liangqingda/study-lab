## 1. 消息语义和承载方式分开

stdio 使用应用启动的子进程标准流；Streamable HTTP 使用 HTTP 端点。两者都承载 MCP 消息，但进程生命周期、元数据外层映射、取消和断开机制不同。

本节基线 2026-07-28：Streamable HTTP 移除了旧的独立 GET 流和协议级会话。不要把 2025 版 session id、GET SSE 或服务端主动 JSON-RPC 请求流程写成新版必选行为。

## 2. 两种传输对照

| 项目     | stdio                      | 新版 Streamable HTTP             |
| -------- | -------------------------- | -------------------------------- |
| 运行方式 | 客户端启动本地子进程       | 服务独立运行，可被多个客户端访问 |
| 分帧     | 一行一个 JSON-RPC 消息     | 每个客户端消息独立 POST          |
| 响应     | stdout 的相关响应/通知     | JSON 或请求范围内 SSE            |
| 日志     | stderr，不能污染 stdout    | 独立日志通道，不混入响应流       |
| 取消     | 发送引用请求 id 的取消通知 | 按绑定关闭相关响应流             |

新版 HTTP 需要适用的版本/元数据首部，并与主体中的元数据一致；普通 curl 能 POST JSON 并不证明满足全部 MCP HTTP 绑定要求。

## 3. 完整分帧实验：标准输出不能打印 ready

先预测：在服务器 stdout 多打印一行 ready，客户端会发生什么？保存 `line-server.mjs`：

```js
import readline from 'node:readline';
const input = readline.createInterface({ input: process.stdin });
console.error('lesson process ready');
input.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    if (request.id === undefined) return;
    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result: { resultType: 'complete', echo: request.method },
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch {
    console.error('invalid input line');
  }
});
```

保存 `line-client.mjs`：

```js
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import assert from 'node:assert/strict';
const child = spawn(process.execPath, ['line-server.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const output = readline.createInterface({ input: child.stdout });
const rows = [];
output.on('line', (line) => rows.push(JSON.parse(line)));
child.stdin.end(
  JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'lesson/echo' }) + '\n',
);
await new Promise((resolve, reject) => {
  child.once('exit', (code) =>
    code === 0 ? resolve() : reject(new Error('child failed')),
  );
  child.once('error', reject);
});
assert.equal(rows[0].result.echo, 'lesson/echo');
console.log('framing and EOF shutdown verified');
```

在两个文件同目录运行 `node line-client.mjs`，预期看到 stderr 的准备日志和验证成功。关闭 stdin 后子进程自然结束。它只演示分帧和进程关闭，lesson/echo 不是 MCP 标准方法，也没有实现版本校验，因此**不是完整 MCP server**。

## 4. HTTP 流不等于独立服务器推送通道

新版一次 POST 可以返回 SSE，其中通知和最终响应与该请求相关；需要长期变更通知时使用相应 subscriptions/listen 请求。SSE 的事件边界也不能当 TCP chunk 边界解析。旧版 GET 流、会话恢复和 Last-Event-ID 的经验不能不经版本核对直接复用。

代理缓冲、空闲超时、请求体限制和连接取消都会影响结果。服务器要验证 Origin，尤其本地 HTTP 服务应限制监听地址并建立适当身份认证，防止远程网页借本地端点访问能力。

## 5. 常见错误与练习

1. 故意把 console.error 改为 console.log，验收客户端复现解析失败并解释通道污染。
2. 发送两条一行 JSON，验收按 id 关联，不依赖进程数据事件一次一条。
3. 为 HTTP 接入写新旧版本对照，验收明确 POST、元数据、响应格式、取消和不支持行为，不把旧 GET 流列为新版要求。

## 6. 资料链接

- [MCP：stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)
- [MCP：Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
- [MCP：传输总览](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)
