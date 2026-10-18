## 1. 把不可信输入转为明确参数

网络输入不能因为来自自己的前端就被信任。**语法校验**检查 JSON 能否解析，**结构校验**检查字段及类型，**业务校验**检查值在当前业务状态中是否合法。**认证**确认请求者是谁，**授权**确认其是否能操作当前资源。

实验基于 Express 5；为突出边界使用手写小校验，实际跨端接口应复用仓库 Zod 契约，而非再维护一份不一致的类型。

## 2. 契约要覆盖成功与失败

| 输入/边界  | 约束                        | 失败语义              |
| ---------- | --------------------------- | --------------------- |
| JSON 主体  | 可解析、大小受限            | 400 或 413            |
| title      | 字符串、去空白后 1～80 字符 | 400                   |
| 未知字段   | 本例拒绝                    | 400，防止意外批量赋值 |
| 用户身份   | 实验替身，不是真实认证      | 生产需验证凭据        |
| 资源 owner | 只能访问自己的文章          | 403，或按策略返回 404 |

TypeScript 类型在运行时消失，不能保护真正的网络边界。校验之后构造允许的业务对象，而不是 `Object.assign(model, req.body)`。

## 3. 完整实验：不让 owner 来自请求体

先预测：提交 owner='admin' 是否会改变文章所有者？安装 `express@5`，保存 `validation.mjs`：

```js
import express from 'express';
const app = express();
app.use(express.json({ limit: '4kb' }));
// 仅为本地实验固定身份；不能作为生产认证中间件。
app.use((req, res, next) => {
  res.locals.user = { id: 'learner' };
  next();
});
const articles = new Map();
let nextId = 1;
app.post('/articles', (req, res) => {
  const body = req.body;
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => k !== 'title')
  ) {
    return res.status(400).json({ error: 'only title is allowed' });
  }
  if (
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    body.title.trim().length > 80
  ) {
    return res.status(400).json({ error: 'invalid title' });
  }
  const article = {
    id: String(nextId++),
    title: body.title.trim(),
    owner: res.locals.user.id,
  };
  articles.set(article.id, article);
  res
    .location(`/articles/${article.id}`)
    .status(201)
    .json({ id: article.id, title: article.title });
});
app.get('/articles/:id', (req, res) => {
  const article = articles.get(req.params.id);
  if (!article || article.owner !== res.locals.user.id)
    return res.status(404).json({ error: 'not found' });
  res.json({ id: article.id, title: article.title });
});
app.listen(4324, '127.0.0.1');
```

```sh
node validation.mjs
curl -i -H 'Content-Type: application/json' -d '{"title":" First "}' http://127.0.0.1:4324/articles
curl -i -H 'Content-Type: application/json' -d '{"title":"X","owner":"admin"}' http://127.0.0.1:4324/articles
curl -i http://127.0.0.1:4324/articles/1
```

预期 201 返回修剪后的 First，带 owner 的请求 400，读取 1 返回允许的两个公开字段。Ctrl+C 停止服务。身份固定和内存存储都是教学替身，不能据此声称完成登录或持久化。

## 4. 响应同样需要边界

响应契约避免前端猜字段，并防止把内部对象的密码、令牌、owner 详情等原样泄露。状态码和主体要一致：201 表示创建成功，204 不应带 JSON 主体。错误对象给稳定错误码与可理解说明，日志可以记录内部原因，但不能把全部堆栈返回客户端。

字符串长度还涉及业务定义：JS length 计 UTF-16 代码单元，未必等于人眼字符数。金额不宜直接依赖二进制浮点数；日期应明确时区语义。不要在校验规则里偷偷改变本该由业务决定的口径。

## 5. 错误驱动与安全边界

错误版本让客户端提交 userId，再按 userId 返回资料，这是典型资源授权漏洞入口。正确做法从可信认证结果取得身份，再在资源层校验权限。即便 id 是合法整数，也不代表当前用户有权访问它。

SQL 参数化处理注入风险，但不替代业务字段校验；HTML 输出编码处理展示上下文风险，也不替代授权。每层解决各自的问题。

## 6. 练习与验收

1. 为本例添加更新标题接口，验收复用同一 title 规则且不接受 owner 变更。
2. 将固定身份改成可注入测试身份，用两个用户测试跨用户读取；验收即使知道资源 id 仍无法越权。
3. 写出成功、非法类型、空白、未知字段、过长和不存在六组请求/响应契约，验收与实际状态一致。

## 7. 资料链接

- [Express：安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP：输入校验](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP：授权](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
