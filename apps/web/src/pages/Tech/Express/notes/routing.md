## 1. 路由是在协议边界做分发

路由把“方法与路径”匹配到处理器。路径参数表示资源标识，查询参数常表示过滤和分页，请求体表示提交的数据。不要因为值最终都是字符串或 JSON，就把它们当成同一种输入来源。

本节使用 Express 5。路径模式在不同 Express 主版本之间有变化，尤其通配符和可选片段，应对照当前版本文档，不复制 Express 4 的模式字符串。

## 2. 术语与组织方式

| 术语   | 定义                 | 示例                                     |
| ------ | -------------------- | ---------------------------------------- |
| Route  | 方法和路径的匹配规则 | GET /articles/:id                        |
| Router | 可挂载的路由组       | app.use('/api', router)                  |
| params | 命名路径参数         | /articles/7 产生 id='7'                  |
| query  | 查询字符串解析结果   | ?limit=10 与路由路径分开                 |
| mount  | 把路由组放到前缀下   | Router 内 /articles 对外是 /api/articles |

Router 内的 req.url、req.baseUrl 与 req.originalUrl 分别帮助理解当前剩余路径、挂载前缀和原始请求路径。查询参数可能重复或具有非预期结构，不能未经检查就当成单个字符串。

## 3. 完整实验：静态路径与动态参数

先预测：若把 /search 放在 /:id 后面，访问 /search 会落入谁？在独立目录安装 `express@5`，保存为 `routing.mjs`：

```js
import express from 'express';
const app = express();
const router = express.Router();
router.get('/articles/search', (req, res) => {
  const q = req.query.q;
  if (typeof q !== 'string' || q.length > 50)
    return res.status(400).json({ error: 'invalid q' });
  res.json({ q, results: [] });
});
router.get('/articles/:id', (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id))
    return res.status(400).json({ error: 'invalid id' });
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id))
    return res.status(400).json({ error: 'id too large' });
  res.json({ id, base: req.baseUrl, original: req.originalUrl });
});
app.use('/api', router);
app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.listen(4322, '127.0.0.1');
```

```sh
node routing.mjs
curl -i 'http://127.0.0.1:4322/api/articles/search?q=css'
curl -i 'http://127.0.0.1:4322/api/articles/7?preview=1'
curl -i 'http://127.0.0.1:4322/api/articles/nope'
```

预期第一条 q 为 css，第二条 id 为数字 7、base 为 /api、original 保留查询字符串，第三条 400。停止服务使用 Ctrl+C。

## 4. 按注册顺序逐个理解

Express 不会自动按“最具体路由”重新排序。匹配的处理器若已响应，后面的候选不会自动执行；若调用 next，才继续走后续栈。动态路由可能吞掉 search 这种静态词，因此把静态分支放前，或在设计上消除歧义。

404 通常是所有正常路由都未给出响应后的兜底，不是框架替每个业务函数抛出的异常。405 表示目标存在但方法不支持，Express 的普通 404 兜底不会替你自动建立完整方法清单，需按接口策略明确实现。

## 5. 常见错误与边界

`parseInt('7abc')` 得到 7，若只依赖它就会错误接受输入。先校验完整格式，再转数值并检查安全范围。`req.query.limit || 10` 也混淆了缺失、空字符串、零和非法对象，应逐种处理。

挂载 Router 不等于权限隔离。所有资源处理仍需身份与授权校验；不能因为路径位于 /admin 就认为只有管理员能访问。也不要直接把 params.id 拼入 SQL。

## 6. 练习与验收

1. 调换实验中两条路由顺序，记录 search 请求如何变化。验收指出实际命中的处理器与停止位置。
2. 新增 limit 查询参数，允许 1 到 100，验收覆盖缺失、重复、负数、小数、过大与非数字。
3. 给同一 Router 挂两个不同前缀，验收解释 originalUrl 与 baseUrl 的区别，不复制两份业务处理器。

## 7. 资料链接

- [Express：路由](https://expressjs.com/en/guide/routing.html)
- [Express：迁移到 5](https://expressjs.com/en/guide/migrating-5.html)
