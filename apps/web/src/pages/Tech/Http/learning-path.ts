/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * HTTP 独立技术学习大纲；阶段由知识依赖与能力目标设计，与 Demo 清单无关联。
 */
export const learningPath = {
  label: 'HTTP',
  description:
    '从请求与响应语义开始，逐步理解连接、缓存、浏览器安全和协议演进，具备用网络面板定位问题的能力。',
  steps: [
    {
      id: 'http-curriculum-model',
      kind: 'concept',
      title: '资源、URL 与请求响应模型',
      summary: '建立客户端、服务器、代理和资源之间的关系。',
      content:
        '## 学习目标\n\n建立客户端、服务器、代理和资源之间的关系。\n\n## 前置知识\n\n已具备该技术所需的入门背景。\n\n## 核心知识与学习顺序\n\n1. HTTP 定义消息与交互语义；URL 标识访问目标，路径、查询和片段用途不同，片段通常不随请求发送到服务器。\n\n2. 区分 DNS 名称解析、传输连接、TLS 安全协商与 HTTP 消息；一次页面加载通常包含多个请求。\n\n## 独立练习\n\n用浏览器网络面板观察一次页面加载，选出文档请求及它发起的资源请求。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能画出客户端到源站的链路，并区分域名、端口、路径、查询与片段。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-messages',
      kind: 'concept',
      title: '消息结构、方法与状态码',
      summary: '读懂请求行、响应状态、首部与消息体。',
      content:
        '## 学习目标\n\n读懂请求行、响应状态、首部与消息体。\n\n## 前置知识\n\n先完成「资源、URL 与请求响应模型」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 学习 GET、POST、PUT、PATCH、DELETE 的语义，区分安全性与幂等性；是否可以重试不能只看方法名称。\n\n2. 状态码分组描述处理结果；Content-Type 描述表示格式，Accept 表达可接受格式，不能把首部与业务字段混为一谈。\n\n## 独立练习\n\n使用 curl -i 读取公开页面，标注状态与首部；自行构造两种方法相同但业务效果不同的重试场景。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能区分 200、201、204、301/302、304、400、401、403、404 与 500 的使用情境。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-connections',
      kind: 'concept',
      title: '连接、TLS 与协议版本',
      summary: '理解延迟与连接复用来自哪里。',
      content:
        '## 学习目标\n\n理解延迟与连接复用来自哪里。\n\n## 前置知识\n\n先完成「消息结构、方法与状态码」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. HTTP/1.1、HTTP/2、HTTP/3 共享核心语义，但消息承载和多路复用方式不同；HTTP/3 使用 QUIC。\n\n2. TLS 提供传输中的机密性、完整性与对端认证；HTTPS 不意味着服务端应用没有漏洞。区分连接建立、首字节时间与下载时间。\n\n## 独立练习\n\n在网络面板中显示协议与时间分解，观察冷连接与连接复用的差别。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释协议版本、TLS 和缓存分别影响什么，不能把所有慢请求归因于服务端处理。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-representations',
      kind: 'concept',
      title: '表示、协商与流式传输',
      summary: '理解同一资源如何返回不同的表示。',
      content:
        '## 学习目标\n\n理解同一资源如何返回不同的表示。\n\n## 前置知识\n\n先完成「连接、TLS 与协议版本」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 内容协商通过请求偏好与服务器策略选择格式、语言或编码；Vary 声明哪些请求首部影响缓存的表示选择。\n\n2. 学习压缩、范围请求与流式读取；传输分段不等于业务消息分帧，不能假设一次读取就是完整 JSON。\n\n## 独立练习\n\n比较同一资源的压缩与未压缩响应，分析大文件范围读取或分块读取的边界。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释 Content-Encoding 与 Content-Type 的区别，并正确累计流式数据。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-caching',
      kind: 'concept',
      title: '缓存、新鲜度与条件请求',
      summary: '区分直接复用缓存与向服务器重新验证。',
      content:
        '## 学习目标\n\n区分直接复用缓存与向服务器重新验证。\n\n## 前置知识\n\n先完成「表示、协商与流式传输」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. Cache-Control 描述新鲜度与存储规则；no-cache 允许存储但使用前要验证，no-store 要求不要存储。\n\n2. ETag 与 Last-Modified 可用于条件请求；304 表示可继续使用缓存表示，通常不携带新的表示体。共享缓存与私有缓存的边界不同。\n\n## 独立练习\n\n画出首次请求、仍新鲜、过期后验证的三段时序，比较更新与未更新资源的响应。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能选择静态指纹资源与敏感页面的缓存策略，并解释为何出现 304。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-browser-security',
      kind: 'concept',
      title: 'Cookie、会话与浏览器跨源安全',
      summary: '把身份状态和浏览器访问边界分开理解。',
      content:
        '## 学习目标\n\n把身份状态和浏览器访问边界分开理解。\n\n## 前置知识\n\n先完成「缓存、新鲜度与条件请求」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. HTTP 无状态不妨碍应用通过 Cookie 关联会话；理解 Secure、HttpOnly、SameSite 的作用及限制。\n\n2. 同源策略限制脚本读取跨源数据；CORS 是服务器向浏览器声明访问许可，预检不是鉴权。区分 CSRF 与 XSS。\n\n## 独立练习\n\n针对跨源携带 Cookie 的请求列出源、凭据、预检和响应首部需求，并分析一个 CSRF 场景。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能说明浏览器拦截发生在哪一步，以及为何允许 CORS 不能替代权限校验。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-reliability',
      kind: 'concept',
      title: '代理、超时、重试与可观测性',
      summary: '在多跳链路中定位失败并控制重试成本。',
      content:
        '## 学习目标\n\n在多跳链路中定位失败并控制重试成本。\n\n## 前置知识\n\n先完成「Cookie、会话与浏览器跨源安全」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 代理可能终止 TLS、转发请求或缓存响应；转发首部的信任必须限制在可信代理范围。\n\n2. 区分连接超时、读取超时、请求取消与应用错误；重试应考虑幂等、退避和总时间预算。用请求标识关联多跳日志。\n\n## 独立练习\n\n为支付创建请求设计超时与幂等键策略，推演响应丢失但服务器已完成操作的情况。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能避免重复扣费，并区分 502、503、504 与业务失败。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
    {
      id: 'http-curriculum-project',
      kind: 'lab',
      title: '综合实践：解释一次真实请求',
      summary: '独立完成从网络现象到协议原因的排查。',
      content:
        '## 学习目标\n\n独立完成从网络现象到协议原因的排查。\n\n## 前置知识\n\n先完成「代理、超时、重试与可观测性」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 按 URL 解析、连接、安全、请求、响应、缓存与浏览器策略顺序收集证据。\n\n2. 只在有依据时归因，记录可复现条件、观察结果和修复前后的差异。\n\n## 独立练习\n\n选择一个页面，整理成功请求、缓存命中、重定向和失败请求各一例。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n交付请求时序、关键首部注释和诊断报告，能够解释每一个结论的证据。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[HTTP 官方学习资料](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)\n',
    },
  ],
} as const;
