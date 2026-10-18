## 1. 三个角色与两代生命周期

Host 是 AI 应用的宿主，管理模型交互和策略；Client 是与某个服务通信的协议组件；Server 提供能力。同一 Host 可以管理多个 Client，服务可以服务多个用户。**进程、连接、对话和权限会话不是同一个概念**。

本节基线为 2026-07-28。旧版 initialize 握手用于建立连接/会话上下文；新版按请求携带元数据，没有强制初始化握手。学习旧代码时必须先确定协议版本。

## 2. 消息结构与关联

| 消息         | 最小特征                                | 接收者行为             |
| ------------ | --------------------------------------- | ---------------------- |
| request      | jsonrpc、id、method、params             | 返回同 id 的结果或错误 |
| response     | 同 id，result 或 error                  | 与进行中请求关联       |
| notification | method，无 id                           | 不返回普通对应响应     |
| 新版结果     | resultType 表达 complete 或其他允许结果 | 按协商/支持的类型解析  |

id 不是业务幂等键，也不是用户身份。同一发送方尚未完成的请求 id 不能重复。新版服务器不主动发 JSON-RPC 请求，所需客户端输入通过 MRTR 结果模型表达；旧版双向请求图不能直接套用。

## 3. 新旧版本对照

| 项目           | 2025-11-25 及此前相关模型 | 2026-07-28                                 |
| -------------- | ------------------------- | ------------------------------------------ |
| 建立上下文     | initialize 等握手         | 请求自身携带版本/能力元数据                |
| discover       | 不可假定存在              | 服务实现 server/discover；客户端可用于探测 |
| 多请求状态     | 可能依赖协议会话          | 跨请求状态用显式标识引用，不从连接推断     |
| 服务端需要输入 | 可有服务端请求            | 通过 input_required/MRTR 表达              |

双时代兼容有传输专属探测与回退规则。收到明确的新版 UnsupportedProtocolVersion 错误，表示对方是新版但版本不支持，不该直接回退旧 initialize。

## 4. 完整消息构造实验

先预测：把两条响应倒序处理，会不会关联到错误工具？保存 `correlation.mjs`，运行 `node correlation.mjs`：

```js
import assert from 'node:assert/strict';
const meta = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': {
    name: 'lesson-client',
    version: '1.0.0',
  },
  'io.modelcontextprotocol/clientCapabilities': {},
};
const requests = [
  {
    jsonrpc: '2.0',
    id: 'a',
    method: 'server/discover',
    params: { _meta: meta },
  },
  { jsonrpc: '2.0', id: 'b', method: 'tools/list', params: { _meta: meta } },
];
const pending = new Map(
  requests.map((request) => [request.id, request.method]),
);
const replies = [
  { jsonrpc: '2.0', id: 'b', result: { resultType: 'complete', tools: [] } },
  {
    jsonrpc: '2.0',
    id: 'a',
    result: {
      resultType: 'complete',
      supportedVersions: ['2026-07-28'],
      capabilities: {},
    },
  },
];
const resolved = replies.map((reply) => {
  assert(pending.has(reply.id));
  const method = pending.get(reply.id);
  pending.delete(reply.id);
  return method;
});
assert.deepEqual(resolved, ['tools/list', 'server/discover']);
assert.equal(pending.size, 0);
console.log(JSON.stringify(requests[0]));
```

程序按 id 而非返回顺序关联；打印的 discover 请求包含 params._meta。它只验证消息构造和本地关联，不实现超时、传输、完整 schema 或客户端 SDK。

## 5. 错误边界与观察点

Host 不能把 Client 的连接身份当最终用户身份；同一 stdio 进程也不应被新版服务当成唯一对话。日志使用请求标识和受控业务上下文，不泄露完整元数据中的敏感内容。

旧客户端遇到只支持新版的服务，不一定能自动升级；必须给出可操作的兼容错误。连接成功后仍可能版本不支持、方法不存在或资源无权访问，分别记录协议和业务原因。

## 6. 练习与验收

1. 给实验加入重复 id 和未知 id 检查，验收不会误把响应交给另一个请求。
2. 画出旧版握手与新版请求两张图，验收明确标注版本，不能混成一条“通用流程”。
3. 为双时代客户端写探测决策表，验收区分明确新版版本错误和非新版响应/超时。

## 7. 资料链接

- [MCP：基础消息与元数据](https://modelcontextprotocol.io/specification/2026-07-28/basic)
- [MCP：版本兼容矩阵](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)
- [MCP：服务发现](https://modelcontextprotocol.io/specification/2026-07-28/server/discover)
