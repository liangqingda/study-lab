## 1. 方法描述意图，状态描述结果

HTTP 请求包含方法、目标、首部及可选主体；响应包含状态、首部及可选主体。HTTP/1.1 的文本示例方便阅读，HTTP/2 与 HTTP/3 的线上编码不同，但这些核心语义继续存在。

**安全方法**的定义是客户端没有请求改变服务器状态，并非服务器不能记访问日志；**幂等方法**重复执行相同请求的预期效果与执行一次相同，并非每次响应内容必须完全一致。

## 2. 方法、首部与状态码

| 项目                  | 核心语义                        | 常见误读                         |
| --------------------- | ------------------------------- | -------------------------------- |
| GET / HEAD            | 读取表示/只取响应元数据         | 用 GET 执行扣款会破坏安全语义    |
| PUT                   | 用请求表示创建或替换目标状态    | 不是“任意修改”的同义词           |
| PATCH                 | 对资源应用一组修改              | 是否幂等取决于补丁语义           |
| POST                  | 让目标按自身语义处理请求主体    | 不必然等于新增数据库行           |
| DELETE                | 移除目标关联                    | 第二次可能 404，仍可具有幂等效果 |
| Content-Type / Accept | 主体是什么格式/希望收到什么格式 | 两者不互相替代                   |

2xx 表示成功类结果；3xx 涉及重定向或缓存验证等语义；4xx 表示请求相关失败；5xx 表示服务器侧无法完成。401 通常涉及缺少有效身份凭据并配合认证挑战，403 表示服务器理解请求但拒绝处理；404 也可用于不泄露资源存在性。不能根据状态码分组推断“具体是谁写错代码”。

## 3. 完整实验：创建、读取与空响应

先预测：204 响应还能附带 JSON 正文吗？保存为 `messages.mjs`：

```js
import http from 'node:http';
let value = null;
http
  .createServer(async (req, res) => {
    if (req.url !== '/item') {
      res.writeHead(404);
      return res.end();
    }
    if (req.method === 'POST') {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 1024) {
          res.writeHead(413);
          return res.end();
        }
      }
      try {
        value = JSON.parse(raw);
      } catch {
        res.writeHead(400);
        return res.end('invalid JSON');
      }
      res.writeHead(201, {
        Location: '/item',
        'Content-Type': 'application/json',
      });
      return res.end(JSON.stringify(value));
    }
    if (req.method === 'DELETE') {
      value = null;
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'GET') {
      res.writeHead(value === null ? 404 : 200, {
        'Content-Type': 'application/json',
      });
      return res.end(JSON.stringify(value));
    }
    res.writeHead(405, { Allow: 'GET, POST, DELETE' });
    res.end();
  })
  .listen(4312, '127.0.0.1');
```

```sh
node messages.mjs
# 另一个终端依次运行
curl -i -X POST -H 'Content-Type: application/json' -d '{"name":"A"}' http://127.0.0.1:4312/item
curl -i http://127.0.0.1:4312/item
curl -i -X DELETE http://127.0.0.1:4312/item
curl -i http://127.0.0.1:4312/item
```

预期依次 201、200、204、404。204 不包含消息主体；客户端直接对它调用 JSON 解析通常失败，应先判断状态或是否有主体。示例是进程内存模型，重启即丢失；它展示协议，不承担生产存储职责。结束后 Ctrl+C。

## 4. 重定向与错误边界

301/302 在历史客户端行为中可能把 POST 后续改为 GET，303 明确常用于“处理后读取结果”，307/308 要求保持方法。处理含凭据的跨目标跳转时还需考虑安全边界。304 不是“去另一 URL”，而是缓存验证后复用已有表示。

示例仅校验 JSON 语法；`{"name":123}` 仍是合法 JSON，但可能违反业务契约。还缺少完整的内容类型校验、鉴权、生产限流与持久化。知道这些边界才能不把一个教学服务器误当成完整 API。

## 5. 失败案例

错误版本返回 `200 {"error":"not found"}`，客户端、监控和缓存只能把它当成功状态处理。修复为适当的 4xx，同时保持机器可读错误结构。反过来，业务校验失败也不应全部返回 500，免得自动重试和告警策略误判。

## 6. 练习与验收

1. 给 POST 增加 Content-Type 和 name 类型检查，分别观察 415、400 与 201；验收列出首部、语法、业务三层失败。
2. 实现 PUT 的替换语义，连续两次发送相同请求，解释状态码可以变化而目标状态不变。
3. 用浏览器或 curl 比较 303 和 307，验收服务端日志能证明后续请求方法不同。

## 7. 资料链接

- [MDN：HTTP 方法](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [MDN：HTTP 状态码](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [HTTP Semantics（RFC 9110）](https://httpwg.org/specs/rfc9110.html)
