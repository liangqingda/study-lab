## 1. 交付目标：解释证据而不是背名词

选择一个页面，形成能复现的 HTTP 诊断报告。报告需要解释首次加载、重定向、缓存验证、失败和客户端限制；不能把服务器处理、网络等待和浏览器渲染混成一个“耗时”。

本节提供完全本地的诊断靶场。需要 Node.js 20+、curl 和浏览器，不依赖外部网站是否变化。没有真实身份和写入业务。

## 2. 完整靶场

先预测 `/start` 跳转后，`/data` 的重复请求会返回什么？保存为 `http-project.mjs`：

```js
import http from 'node:http';
const server = http.createServer((req, res) => {
  console.log(req.method, req.url, req.headers['if-none-match'] ?? '-');
  if (req.url === '/start') {
    res.writeHead(302, { Location: '/page' });
    return res.end();
  }
  if (req.url === '/page') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('<h1>HTTP 实验</h1><a href="/data">查看数据</a>');
  }
  if (req.url === '/data') {
    res.setHeader('ETag', '"data-v1"');
    res.setHeader('Cache-Control', 'no-cache');
    if (req.headers['if-none-match'] === '"data-v1"') {
      res.writeHead(304);
      return res.end();
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end('{"ok":true}');
  }
  if (req.url === '/unavailable') {
    res.writeHead(503, { 'Retry-After': '5' });
    return res.end('try later');
  }
  res.writeHead(404);
  res.end('not found');
});
server.listen(4319, '127.0.0.1');
```

```sh
node http-project.mjs
# 另一个终端
curl -i http://127.0.0.1:4319/start
curl -i -L http://127.0.0.1:4319/start
curl -i http://127.0.0.1:4319/data
curl -i -H 'If-None-Match: "data-v1"' http://127.0.0.1:4319/data
curl -i http://127.0.0.1:4319/unavailable
```

结束后 Ctrl+C。`-L` 让 curl 跟随重定向；不加时只显示第一跳。这里没有 TLS，因此不能从本地结果声称已经验证证书或 HTTPS 连接性能。

## 3. 记录表与结果推导

| 场景         | 预期证据          | 正确结论                           |
| ------------ | ----------------- | ---------------------------------- |
| 不跟随跳转   | 302 + Location    | 客户端下一步可访问另一个目标       |
| 跟随跳转     | 302 后 200 HTML   | 一次命令不等于一次请求             |
| 首次数据读取 | 200 + ETag + JSON | 获取当前表示与验证器               |
| 相同验证器   | 304，无新表示体   | 可复用已存主体                     |
| 服务不可用   | 503 + Retry-After | 暂时不可用，重试仍要考虑预算与语义 |
| 未定义路径   | 404               | 连接成功，应用没有返回该资源       |

浏览器普通访问 `/start`，开启 Preserve log 保存跳转链。再观察 `/data`，注意浏览器可能进行自动缓存验证；人工 curl 条件请求和浏览器缓存是两种观察角度，不能把工具行为直接等同。

## 4. 故障注入

把 /data 的 ETag 改为错误固定值但持续修改正文，会出现“变化未被验证器表达”的问题；把 503 改成 200 而只在主体写 error，会误导状态监控；把 Location 改回 /start，会形成重定向循环。每次只注入一个变化，保留修改前后的请求和响应。

诊断结论至少包含：触发条件、请求方法/目标、状态/关键首部、时间或日志证据、原因与修复。若结果只在浏览器失败而 curl 成功，进一步检查 CORS、Cookie、Mixed Content 和客户端策略，但不要凭差异自动认定就是 CORS。

## 5. 延伸：真实链路的报告范围

真实站点可能有 CDN、反向代理、TLS、HTTP/2/3 和服务端聚合。用 Network、服务端日志、链路追踪分别覆盖不同层；请求 ID 帮助关联，但不应泄露内部拓扑或敏感凭据。对第三方站点只做有授权的普通读取，不进行压力或安全攻击实验。

## 6. 练习与验收

1. 为靶场增加一个返回慢响应的路径，设置客户端总截止时间，验收说明超时不证明服务端没工作。
2. 整理一张至少五条请求的时序图，每条标注方法、目标、状态、表示来源与是否有主体。
3. 选一个真实页面做同样报告，区分亲自观察、根据协议推导和暂未验证的结论。
4. 修复三种故障注入并各加回归检查，验收不能只提交截图，必须解释关键证据。

## 7. 资料链接

- [MDN：HTTP 概览](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN：缓存](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [Node.js：HTTP](https://nodejs.org/api/http.html)
