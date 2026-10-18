## 1. 契约、分发与业务执行各有边界

能力实现应先定义名称、用途、输入限制、输出结构和错误，再连接具体外部系统。协议层错误表示消息或方法不符合要求；工具执行失败表示协议请求合法，但业务操作未完成。二者不能全部变成空字符串或“成功但没结果”。

本节按 2026-07-28 讲解 resultType 与每请求元数据。下例是完整可运行的**分发核心单元实验**，没有实现所有 MCP 必选方法和传输，因此不宣称是可直接接入任意客户端的完整 server；正式服务需使用明确支持目标版本的 SDK 并验证规范。

## 2. 输入输出契约

只读 search_docs 接受长度 1～80 的 query，最多返回两条样本文档。成功为空数组代表查询成功但未匹配；上游异常则是失败。错误日志保留内部原因，返回值不暴露文件路径和凭据。

| 状况                    | 层次          | 处理意图                   |
| ----------------------- | ------------- | -------------------------- |
| 非法 JSON-RPC 外形      | 协议          | 拒绝消息                   |
| 不支持的版本            | 协议          | 按规范版本错误处理         |
| 未知方法/工具或非法参数 | 协议/能力契约 | 明确错误，不执行           |
| 搜索依赖失败            | 工具业务      | 失败结果，不能伪装为空数组 |

## 3. 完整可运行核心

先预测：空 query 和合法但无匹配的 query 是否返回同一种结果？保存 `dispatcher.mjs`：

```js
import assert from 'node:assert/strict';
const version = '2026-07-28';
function dispatch(request, search) {
  const error = (code, message) => ({
    jsonrpc: '2.0',
    id: request.id,
    error: { code, message },
  });
  if (request.jsonrpc !== '2.0' || request.id == null)
    return error(-32600, 'Invalid Request');
  if (
    request.params?._meta?.['io.modelcontextprotocol/protocolVersion'] !==
    version
  ) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32022,
        message: 'Unsupported protocol version',
        data: {
          supported: [version],
          requested:
            request.params?._meta?.['io.modelcontextprotocol/protocolVersion'],
        },
      },
    };
  }
  if (request.method !== 'tools/call') return error(-32601, 'Method not found');
  const { name, arguments: args } = request.params;
  if (
    name !== 'search_docs' ||
    typeof args?.query !== 'string' ||
    !args.query.trim() ||
    args.query.length > 80
  )
    return error(-32602, 'Invalid params');
  try {
    const rows = search(args.query);
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        resultType: 'complete',
        content: [{ type: 'text', text: JSON.stringify(rows) }],
      },
    };
  } catch {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        resultType: 'complete',
        isError: true,
        content: [{ type: 'text', text: 'Search temporarily unavailable' }],
      },
    };
  }
}
const base = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    _meta: {
      'io.modelcontextprotocol/protocolVersion': version,
      'io.modelcontextprotocol/clientInfo': { name: 'lesson', version: '1' },
      'io.modelcontextprotocol/clientCapabilities': {},
    },
    name: 'search_docs',
    arguments: { query: 'cache' },
  },
};
assert.equal(dispatch(base, () => []).result.content[0].text, '[]');
assert.equal(
  dispatch(
    { ...base, params: { ...base.params, arguments: { query: '' } } },
    () => [],
  ).error.code,
  -32602,
);
assert.equal(
  dispatch(base, () => {
    throw new Error('secret upstream path');
  }).result.isError,
  true,
);
console.log('empty, invalid and upstream failure distinguished');
```

运行 `node dispatcher.mjs`。本实验 search 是同步替身，真实异步依赖需 await，并处理超时和取消；id、元数据、schema 和版本错误数据也需要完整规范校验，不能把这里的局部检查当全部验证器。

### 3.1 端到端标准方法 stdio 练习

为把分发核心放到真正的标准流通道，下面实现只读工具子集。它支持新版 discover/list/call，刻意不实现资源、提示、订阅或旧版握手；这是一份可运行教学子集，不是通过全部协议一致性测试的生产 SDK 替代品。保存两个文件到同一目录。

`mcp-subset-server.mjs`：

```js
import readline from 'node:readline';
const version = '2026-07-28';
const lines = readline.createInterface({ input: process.stdin });
lines.on('line', (line) => {
  let q;
  const send = (value) => process.stdout.write(JSON.stringify(value) + '\n');
  const fail = (code, message, data) =>
    send({
      jsonrpc: '2.0',
      id: q?.id,
      error: { code, message, ...(data ? { data } : {}) },
    });
  try {
    q = JSON.parse(line);
  } catch {
    fail(-32700, 'Parse error');
    return;
  }
  if (
    !q ||
    q.jsonrpc !== '2.0' ||
    q.id == null ||
    !(typeof q.id === 'string' || Number.isInteger(q.id))
  ) {
    fail(-32600, 'Invalid Request');
    return;
  }
  const meta = q.params?._meta;
  if (meta?.['io.modelcontextprotocol/protocolVersion'] !== version) {
    fail(-32022, 'Unsupported protocol version', {
      supported: [version],
      requested: meta?.['io.modelcontextprotocol/protocolVersion'],
    });
    return;
  }
  if (!meta['io.modelcontextprotocol/clientCapabilities']) {
    fail(-32602, 'Missing client capabilities');
    return;
  }
  let result;
  if (q.method === 'server/discover')
    result = {
      supportedVersions: [version],
      capabilities: { tools: {} },
      _meta: {
        'io.modelcontextprotocol/serverInfo': {
          name: 'lesson-subset',
          version: '1',
        },
      },
    };
  else if (q.method === 'tools/list')
    result = {
      tools: [
        {
          name: 'echo',
          description: '只读返回已验证文本',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string', minLength: 1, maxLength: 80 },
            },
            required: ['text'],
            additionalProperties: false,
          },
        },
      ],
    };
  else if (q.method === 'tools/call') {
    const a = q.params.arguments;
    if (
      q.params.name !== 'echo' ||
      !a ||
      typeof a.text !== 'string' ||
      a.text.length < 1 ||
      a.text.length > 80 ||
      Object.keys(a).some((k) => k !== 'text')
    ) {
      fail(-32602, 'Invalid params');
      return;
    }
    result = { content: [{ type: 'text', text: a.text }] };
  } else {
    fail(-32601, 'Method not found');
    return;
  }
  send({
    jsonrpc: '2.0',
    id: q.id,
    result: { resultType: 'complete', ...result },
  });
});
```

`mcp-subset-client.mjs`：

```js
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import assert from 'node:assert/strict';
const child = spawn(process.execPath, ['mcp-subset-server.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = readline.createInterface({ input: child.stdout });
const pending = new Map();
let id = 0;
lines.on('line', (line) => {
  const reply = JSON.parse(line);
  const item = pending.get(reply.id);
  pending.delete(reply.id);
  item?.resolve(reply);
});
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    const _meta = {
      'io.modelcontextprotocol/protocolVersion': '2026-07-28',
      'io.modelcontextprotocol/clientInfo': {
        name: 'lesson-client',
        version: '1',
      },
      'io.modelcontextprotocol/clientCapabilities': {},
    };
    child.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method,
        params: { ...params, _meta },
      }) + '\n',
    );
  });
const rejectPending = (error) => {
  for (const item of pending.values()) item.reject(error);
  pending.clear();
};
const exited = new Promise((resolve) => {
  child.once('exit', () => {
    rejectPending(new Error('child exited'));
    resolve();
  });
  child.once('error', (error) => {
    rejectPending(error);
    resolve();
  });
});
const timer = setTimeout(() => {
  child.kill('SIGTERM');
  console.error('request deadline exceeded');
  process.exitCode = 1;
}, 5000);
try {
  assert(
    (await call('server/discover')).result.supportedVersions.includes(
      '2026-07-28',
    ),
  );
  assert.equal((await call('tools/list')).result.tools[0].name, 'echo');
  assert.equal(
    (await call('tools/call', { name: 'echo', arguments: { text: 'hello' } }))
      .result.content[0].text,
    'hello',
  );
  assert.equal(
    (await call('tools/call', { name: 'echo', arguments: { text: '' } })).error
      .code,
    -32602,
  );
  console.log('discover/list/call and invalid argument verified over stdio');
} finally {
  child.stdin.end();
  await exited;
  clearTimeout(timer);
}
```

运行 `node mcp-subset-client.mjs`，预期四条请求完成断言，退出时关闭 stdin 并等待子进程结束。stdout 只传 JSON 消息；服务端没有网络或文件写入能力。真实 SDK 还应覆盖完整消息 schema、通知、取消、背压、大小限制、权限与版本兼容，不能把这个有限子集无声明地对外宣称为全部 MCP。

## 4. 从核心到服务的实施清单

使用官方 SDK 时，先核对该具体版本支持的协议代际；示例包名存在不等于已支持 2026 行为。实现服务发现、能力列表、调用及必要错误，绑定 stdio 或 HTTP，最后用目标客户端和协议检查工具验证。

把工具输入 schema 与真正执行边界对齐：未知字段怎么处理、字符串有多长、结果最多多大、外部请求发往哪里，都应有明确限制。重试写工具前确认幂等语义，取消后是否还能产生副作用也要说明。

## 5. 常见失败与练习

1. 为实验加入结果上限与输出结构断言，验收上游返回不合法结构时不会原样传播。
2. 把 search 改成异步并注入超时，验收局部超时与对端协议错误不会混淆成同一个“服务器错误”。
3. 按目标版本 SDK 建立真实服务，验收包含 discover/list/call、非法输入、上游失败和进程退出；记录 SDK/客户端版本与未支持能力。

## 6. 资料链接

- [MCP：Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MCP：基础消息与错误](https://modelcontextprotocol.io/specification/2026-07-28/basic)
- [MCP：官方 SDK 列表](https://modelcontextprotocol.io/docs/2026-07-28/sdk)
