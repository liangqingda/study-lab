## 1. 综合服务需要怎样的闭环

目标是交付一个小型文章服务：启动配置明确、路由可理解、输入受约束、错误可观察、测试可重复、退出不遗留连接。这里给出可运行骨架，随后要求独立扩展，而不是把已有 Demo 当作项目任务。

实验基线 Express 5、Node.js 20+；存储采用内存，仅用于聚焦服务生命周期，重启会丢数据。正式持久化必须另外设计数据库契约和迁移。

## 2. 完整基线：请求、日志、就绪与退出

先预测：进入退出流程后新的就绪检查应返回 200 还是 503？安装 express@5，保存 `project.mjs`：

```js
import express from 'express';
import { randomUUID } from 'node:crypto';
const port = Number(process.env.PORT ?? 4326);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('invalid PORT');
const app = express();
let ready = true;
const articles = new Map();
app.use((req, res, next) => {
  res.locals.requestId = randomUUID();
  res.setHeader('X-Request-Id', res.locals.requestId);
  res.on('finish', () =>
    console.log(
      JSON.stringify({
        id: res.locals.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
      }),
    ),
  );
  next();
});
app.get('/ready', (req, res) => res.status(ready ? 200 : 503).json({ ready }));
app.use(express.json({ limit: '4kb' }));
app.post('/articles', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 80)
    return res.status(400).json({ code: 'INVALID_TITLE' });
  const item = { id: randomUUID(), title: title.trim() };
  articles.set(item.id, item);
  res.location(`/articles/${item.id}`).status(201).json(item);
});
app.get('/articles/:id', (req, res) => {
  const item = articles.get(req.params.id);
  if (!item) return res.status(404).json({ code: 'NOT_FOUND' });
  res.json(item);
});
app.use((req, res) => res.status(404).json({ code: 'NOT_FOUND' }));
app.use((err, req, res, next) => {
  console.error('failed', res.locals.requestId, err.message);
  if (res.headersSent) return next(err);
  res
    .status(
      err.status === 413 ? 413 : err.type === 'entity.parse.failed' ? 400 : 500,
    )
    .json({ code: 'REQUEST_FAILED' });
});
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`ready:${port}`),
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  ready = false;
  const deadline = setTimeout(() => {
    server.closeAllConnections();
    process.exitCode = 1;
  }, 5000);
  deadline.unref();
  server.close(() => {
    clearTimeout(deadline);
    console.log('stopped');
  });
};
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
```

```sh
node project.mjs
curl -i http://127.0.0.1:4326/ready
curl -i -H 'Content-Type: application/json' -d '{"title":"First"}' http://127.0.0.1:4326/articles
# 从响应中复制 id，再读取 /articles/<id>；完成后 Ctrl+C
```

## 3. 生命周期如何推导

```mermaid
flowchart LR
  A[校验配置] --> B[开始监听并就绪]
  B --> C[接收请求]
  C --> D[信号到达]
  D --> E[停止就绪和接收新连接]
  E --> F[等待在途请求]
  F --> G[关闭依赖与退出]
```

close 之后新连接可能直接失败，而不一定还能得到 /ready 的 503；部署时通常先撤就绪、等待负载均衡传播，再关闭监听。示例把流程简化到单进程本地，不能据此承诺零中断发布。流式长连接、升级连接和数据库池还需要各自的退出策略。

## 4. 验证成功和失败

| 条件      | 预期结果                       |
| --------- | ------------------------------ |
| 合法创建  | 201、Location、可再次读取      |
| 数字标题  | 400，不新增记录                |
| 非法 JSON | 400，稳定错误                  |
| 不存在 id | 404                            |
| PORT=abc  | 启动前失败，不悄悄监听默认端口 |
| Ctrl+C    | 停止本次服务，不留下监听端口   |

请求标识由服务端生成，日志只含必要字段。此基线没有认证、授权、限流和持久化，对外部署前必须补齐实际威胁模型所需控制；不能把“健康检查成功”当作所有依赖都健康。

## 5. 练习与交付验收

1. 提取 createApp，使测试可注入存储；验收业务测试不依赖真实数据库。
2. 加入可信身份与资源授权，验收用户不能读取他人的文章，且日志不含凭据。
3. 增加慢请求与依赖失败测试，验收退出预算有上界、已归还连接、错误分类正确。
4. 交付 README，写明版本、配置、启动、测试、错误契约、数据边界与退出限制，不只提交代码目录。

## 6. 资料链接

- [Express：健康检查与优雅退出](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html)
- [Express：错误处理](https://expressjs.com/en/guide/error-handling.html)
- [Node.js：HTTP 服务器关闭](https://nodejs.org/api/http.html)
