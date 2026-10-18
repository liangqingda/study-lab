/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * HTTP 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
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
      contentFile: 'notes/model.md',
    },
    {
      id: 'http-curriculum-messages',
      kind: 'concept',
      title: '消息结构、方法与状态码',
      summary: '读懂请求行、响应状态、首部与消息体。',
      contentFile: 'notes/messages.md',
    },
    {
      id: 'http-curriculum-connections',
      kind: 'concept',
      title: '连接、TLS 与协议版本',
      summary: '理解延迟与连接复用来自哪里。',
      contentFile: 'notes/connections.md',
    },
    {
      id: 'http-curriculum-representations',
      kind: 'concept',
      title: '表示、协商与流式传输',
      summary: '理解同一资源如何返回不同的表示。',
      contentFile: 'notes/representations.md',
    },
    {
      id: 'http-curriculum-caching',
      kind: 'concept',
      title: '缓存、新鲜度与条件请求',
      summary: '区分直接复用缓存与向服务器重新验证。',
      contentFile: 'notes/caching.md',
    },
    {
      id: 'http-curriculum-browser-security',
      kind: 'concept',
      title: 'Cookie、会话与浏览器跨源安全',
      summary: '把身份状态和浏览器访问边界分开理解。',
      contentFile: 'notes/browser-security.md',
    },
    {
      id: 'http-curriculum-reliability',
      kind: 'concept',
      title: '代理、超时、重试与可观测性',
      summary: '在多跳链路中定位失败并控制重试成本。',
      contentFile: 'notes/reliability.md',
    },
    {
      id: 'http-curriculum-project',
      kind: 'lab',
      title: '综合实践：解释一次真实请求',
      summary: '独立完成从网络现象到协议原因的排查。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
