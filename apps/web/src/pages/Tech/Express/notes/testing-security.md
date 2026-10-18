## 1. 测试是验证契约和风险

业务单元测试隔离依赖，HTTP 集成测试验证中间件、路由、首部、状态和主体如何一起工作。覆盖率数字不能代替错误场景；同样，只有手工点一次成功按钮也不足以证明接口正确。

基线是 Express 5、Node.js 20+ 内置 node:test 与 fetch，不需要真实数据库。真实依赖测试应显式启用并使用隔离环境。

## 2. 先设计测试矩阵

| 场景     | 输入       | 需要检查                      |
| -------- | ---------- | ----------------------------- |
| 成功     | 合法 title | 201、公开字段、Location       |
| 输入失败 | 数字或空白 | 400、不调用保存               |
| 主体过大 | 超过限制   | 413，不无限占内存             |
| 权限失败 | 无权限身份 | 401/403/404 的既定策略        |
| 依赖失败 | 保存抛错   | 5xx、稳定错误、不泄露内部原因 |

认证和授权应分别测；测试替身不是生产安全方案。安全配置也必须结合部署边界：是否有可信反向代理、是否公开到互联网、是否允许跨源凭据。

## 3. 完整实验：真实 HTTP、替身存储

先预测：第二条非法输入会不会增加保存次数？在独立目录安装 express@5，保存 `api.test.mjs`：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
function createApp(save) {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.post('/articles', async (req, res) => {
    if (typeof req.body?.title !== 'string' || !req.body.title.trim())
      return res.status(400).json({ code: 'INVALID' });
    const item = await save(req.body.title.trim());
    res.location(`/articles/${item.id}`).status(201).json(item);
  });
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(err.status === 413 ? 413 : 500).json({ code: 'FAILED' });
  });
  return app;
}
test('HTTP contract and dependency isolation', async () => {
  let calls = 0;
  const server = createApp(async (title) => ({ id: ++calls, title })).listen(
    0,
    '127.0.0.1',
  );
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const good = await fetch(base + '/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":" A "}',
    });
    assert.equal(good.status, 201);
    assert.equal(good.headers.get('location'), '/articles/1');
    assert.deepEqual(await good.json(), { id: 1, title: 'A' });
    const bad = await fetch(base + '/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":7}',
    });
    assert.equal(bad.status, 400);
    await bad.arrayBuffer();
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
```

运行 `node --test api.test.mjs`，预期一个通过的测试。端口 0 让操作系统分配空闲端口，finally 关闭本次服务器，不占用项目开发端口。

## 4. 安全与可观测性的具体检查

输入长度、请求体大小、超时和资源授权是实际边界；CORS 只处理浏览器读响应许可。SQL 使用参数化值，文件访问限制目录边界，重定向校验目标。依赖安全更新需要结合版本与变更记录，不能只添加一个响应头库就声称安全。

日志记录请求 ID、操作、状态和耗时，敏感数据应脱敏或根本不记录。代理信任配置应精确到真实网络边界；盲目信任所有 X-Forwarded-* 可能影响客户端地址、协议和安全策略。

## 5. 错误驱动

测试若直接调用处理器函数，可能绕过 JSON 解析器、错误链和路由挂载；测试若只断言状态码，则可能漏掉秘密字段泄露。修复是按风险选择真实 HTTP 集成，并明确检查主体字段及副作用。

不要用长 sleep 保证异步完成，应等待 listening、请求完成和资源关闭等真实事件。并发测试共享全局计数会互相污染，给每个测试创建独立 app 和替身状态。

## 6. 练习与验收

1. 增加保存失败替身，验收客户端只有 FAILED，内部异常文本不泄露。
2. 增加主体超限与空白标题测试，验收保存调用次数仍不变。
3. 添加两个用户的资源授权用例，验收同一资源 id 在不同身份下结果符合契约。

## 7. 资料链接

- [Node.js：测试运行器](https://nodejs.org/api/test.html)
- [Express：安全实践](https://expressjs.com/en/advanced/best-practice-security.html)
