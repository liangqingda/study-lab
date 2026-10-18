## 1. 资源与表示必须区分

一个资源可以有 JSON、HTML、不同语言或压缩后的多种表示。**内容协商**决定本次选择哪种表示；**内容编码**表示对内容做了何种变换，例如 gzip；**消息分帧**帮助接收者识别消息边界，不等于业务记录边界。

前置知识为消息主体和首部。本节用 Node.js 20+ 演示压缩与流；示例数据刻意很小，真实性能收益需要以实际内容测量。

## 2. 首部对照

| 请求/响应字段                      | 说明                          | 对应结果                             |
| ---------------------------------- | ----------------------------- | ------------------------------------ |
| Accept / Content-Type              | 可接受媒体类型 / 实际媒体类型 | JSON 与 HTML 是不同表示格式          |
| Accept-Encoding / Content-Encoding | 可接受压缩 / 实际内容编码     | gzip 不会把 JSON 的媒体类型变成 gzip |
| Accept-Language / Content-Language | 语言偏好 / 返回语言           | 实际选择仍由服务端策略决定           |
| Vary                               | 哪些请求首部影响表示选择      | 缓存应区分这些请求维度               |
| Range / Content-Range              | 请求部分内容 / 实际范围       | 206 与完整 200 的语义不同            |

不能简单用字符串 includes 判断所有协商：质量权重 q、通配符及 q=0 会影响选择。下面实验仅识别浏览器常见 gzip 声明，是机制演示，不是完整协商器。

## 3. 完整实验：压缩与业务流

先预测：两次 `write()` 是否必定在客户端对应两次 data 事件？保存为 `representations.mjs`：

```js
import http from 'node:http';
import { gzipSync } from 'node:zlib';
http
  .createServer((req, res) => {
    if (req.url === '/events') {
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
      res.write(JSON.stringify({ n: 1 }) + '\n');
      setTimeout(() => res.end(JSON.stringify({ n: 2 }) + '\n'), 100);
      return;
    }
    const body = JSON.stringify({ message: 'hello', language: 'en' });
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Vary', 'Accept-Encoding');
    if (gzip) {
      res.setHeader('Content-Encoding', 'gzip');
      res.end(gzipSync(body));
    } else res.end(body);
  })
  .listen(4314, '127.0.0.1');
```

```sh
node representations.mjs
# 另一个终端
curl -i http://127.0.0.1:4314/
curl -i --compressed http://127.0.0.1:4314/
curl -N http://127.0.0.1:4314/events
```

前两个主体解码后相同，但第二个响应可包含 Content-Encoding:gzip；curl 的 `--compressed` 会请求并自动解码支持的压缩。第三个逐行显示 `{"n":1}` 与 `{"n":2}`。实验结束 Ctrl+C。

## 4. 正确解析流式记录

网络可能合并两次 write，也可能拆开一次 write；TCP、HTTP 帧、压缩与缓冲都能改变读取块边界。NDJSON 用换行定义业务记录，接收方应保留未完成的尾部，而不是对每个 chunk 调 JSON.parse。

```js
// response 是 fetch('/events') 得到的响应。
const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
let rest = '';
for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  rest += value;
  let i;
  while ((i = rest.indexOf('\n')) !== -1) {
    const line = rest.slice(0, i);
    rest = rest.slice(i + 1);
    if (line) console.log(JSON.parse(line));
  }
}
if (rest.trim()) throw new Error('incomplete record');
```

TextDecoderStream 处理跨字节块的字符解码；协议规定每条记录以换行结束，因此非空残留被视为不完整记录。生产实现还需限制记录长度、处理取消、JSON 解析失败与服务端错误，不应无限积累内存。

## 5. 范围读取与常见误区

范围读取依赖服务端支持；请求 `Range:bytes=0-9` 后不能假设一定 206，服务端可能忽略 Range 并返回完整 200。范围不满足时可返回 416。结合 If-Range 可避免在表示已变化时拼接不同版本的数据。

错误做法是按压缩前字符串长度填写压缩后 Content-Length。应使用实际传输的编码字节数，或让服务器采用合法分帧。压缩不是越小越好：CPU 成本、敏感内容与攻击模型也需要考虑。

## 6. 练习与验收

1. 模拟 JSON 在任意位置被切成两块，验收上述解析器仍得到两条完整记录。
2. 给服务端增加语言协商，验收同时正确设置 Content-Language 与 Vary，解释缓存隔离原因。
3. 为范围请求列出 200、206、416 三种响应的客户端处理分支，验收不会把完整主体错误追加到部分文件。

## 7. 资料链接

- [MDN：内容协商](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation)
- [MDN：范围请求](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)
- [MDN：Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
