## 1. 错误必须有可预测的出口

Express 的错误处理不是在每个函数外包一个 try/catch 就结束了。需要知道错误在哪个执行上下文产生、是否进入 Express 链、响应是否已经发送，以及最终由谁记录和结束连接。

本节基于 Express 5。它会把路由或中间件**返回的 Promise** 拒绝转入错误链；未返回、未等待的游离任务和后续异步回调不自动属于这个 Promise。

## 2. 四条错误路径

| 来源           | 如何到达错误处理器                 | 常见漏点                     |
| -------------- | ---------------------------------- | ---------------------------- |
| 同步 throw     | Express 捕获当前调用栈的异常       | 不能覆盖未来计时器里的 throw |
| async 函数拒绝 | Express 5 处理返回的 Promise       | 启动任务却不 await/return    |
| 回调错误       | 显式 next(err) 或转 Promise        | 只 console.log 后请求悬挂    |
| 响应后失败     | 检查 headersSent，交默认处理等策略 | 再发 JSON 导致重复响应       |

错误处理中间件需要 `(err, req, res, next)` 四参数形式，放在正常路由之后。404 本身通常不是异常，应该有单独正常兜底。

## 3. 完整实验：同步、异步和回调

先预测三个失败接口是否都得到相同稳定错误结构？安装 `express@5`，保存 `errors.mjs`：

```js
import express from 'express';
const app = express();
app.get('/sync', () => {
  throw new Error('sync detail');
});
app.get('/promise', async () => {
  await Promise.reject(new Error('promise detail'));
});
app.get('/callback', (req, res, next) => {
  setTimeout(() => {
    try {
      throw new Error('callback detail');
    } catch (err) {
      next(err);
    }
  }, 10);
});
app.get('/started', (req, res, next) => {
  res.write('first chunk\n');
  next(new Error('stream failed'));
});
app.use((req, res) => res.status(404).json({ code: 'NOT_FOUND' }));
app.use((err, req, res, next) => {
  console.error('request failed', req.path, err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ code: 'INTERNAL_ERROR' });
});
app.listen(4325, '127.0.0.1');
```

```sh
node errors.mjs
curl -i http://127.0.0.1:4325/sync
curl -i http://127.0.0.1:4325/promise
curl -i http://127.0.0.1:4325/callback
curl -i http://127.0.0.1:4325/started
```

前三条预期 500 和稳定的 INTERNAL_ERROR，服务端分别保留内部原因。最后一条已经开始响应，默认错误处理可能关闭连接；curl 的具体错误文本和是否已显示部分主体取决于缓冲与版本，不承诺固定文案。Ctrl+C 停止。

## 4. 返回 Promise 的实际含义

错误写法 `app.get('/x', (req,res)=>{ saveLater(); res.send('ok'); })` 中，saveLater 的拒绝不会因“里面用了 Promise”而被 Express 自动捕获。若它属于请求的一部分，就 await 并在成功后响应；若它是后台任务，就需要独立的任务持久化、错误观察和重试机制，不应悄悄丢到进程里。

Promise 捕获也不能自动撤销已经发生的副作用。保存数据库后发送邮件失败，需要明确事务边界与业务补偿；HTTP 错误处理器只负责错误出口，不是分布式事务协调器。

## 5. 错误分类和信息边界

预期业务错误可映射为 400、404、409 等，并给稳定业务码；意外异常通常返回适当 5xx。日志包含请求标识、操作和必要上下文，不写密码、令牌或未经筛选的请求体。客户端不应看到数据库地址、SQL 堆栈或内部文件路径。

一个分支既调用 next(err) 又继续 throw，可能重复处理同一错误。传递后结束当前函数；全局 uncaughtException 不是继续运行损坏请求的日常机制，应按运行策略记录并进行受控退出/重启。

## 6. 练习与验收

1. 增加一个 409 冲突业务错误，验收不会全部错报为 500，且日志仍能定位原因。
2. 故意创建未 await 的拒绝，随后改为正确返回 Promise；验收解释两版控制流差异，而非只看是否打印错误。
3. 为流式接口设计开始前失败和开始后失败两套策略，验收不在 headersSent 后重发 JSON。

## 7. 资料链接

- [Express：错误处理](https://expressjs.com/en/guide/error-handling.html)
- [Express：升级至 5](https://expressjs.com/en/guide/migrating-5.html)
