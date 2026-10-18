/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * MCP（Model Context Protocol）模块的学习路径（教学大纲）。
 *
 * 这是模块级的学习总览数据源：`pnpm gen:routes` 检测到本文件存在，就自动为
 * `tech/mcp` 生成「学习路径」落地页与侧边栏入口；落地页与概念页底部的学习
 * 路径控件按本文件的步骤顺序渲染。
 *
 * 内容依据：https://modelcontextprotocol.io/docs 及其子页（Introduction /
 * Architecture / Tools / Resources / Prompts / Transports）。
 *
 * 关键约定（区别于“demo 列表”）：
 * - `steps` 是**设计的教学路径**：MCP 是协议，学习以概念为主，路径按
 *   “先建立全局图景 → 拆解三角色 → 逐个理解三大原语与传输 → 串成完整闭环”
 *   组织，每步都是概念介绍页（kind: `concept`）。
 * - 每步 `demo` 对应本分类下的页面目录名（kebab-case，如 `Architecture` →
 *   `architecture`），前端据此推导「开始学习」弹窗预览的路由。
 * - 每步 `id` 必须稳定且唯一，作为完成状态与熟练度的本地存储 key。
 * - 本文件只放字面量数据，不 `import` 任何模块。
 */
export const learningPath = {
  /** 模块展示名，用作落地页标题与侧边栏「学习路径」入口的文案。 */
  label: 'MCP',
  /** 模块整体说明，展示在落地页顶部。 */
  description:
    'MCP（Model Context Protocol）是连接 AI 应用与外部系统的开源标准协议，官方称它是“AI 应用的 USB-C”。本路径按“先建立全局图景 → 拆解三角色 → 理解三大原语与传输 → 串联完整闭环”组织：先弄清它解决什么问题，再看 Host / Client / Server 三角色如何协作，随后逐个理解 Tools、Resources、Prompts 三个核心原语与 stdio / Streamable HTTP 两种传输，最后串成一次完整会话并梳理安全最佳实践。每一步都有可进入的概念页。',
  /** 推荐学习步骤（教学路径，每一步都关联一个页面）。 */
  steps: [
    {
      id: 'mcp-intro',
      kind: 'concept',
      demo: 'Intro',
      title: '认识 MCP：为什么需要它',
      summary:
        '用一个“AI 应用的 USB-C”理解 MCP：它是什么、解决什么问题、对开发者/应用/终端用户各带来什么，先建立全局图景。',
    },
    {
      id: 'mcp-architecture',
      kind: 'concept',
      demo: 'Architecture',
      title: '核心架构：Host / Client / Server',
      summary:
        '拆解 MCP 的三角色与一次会话如何建立：Host 容器与协调、Client 连接器、Server 能力提供者，以及底层统一的 JSON-RPC 消息。',
    },
    {
      id: 'mcp-tools',
      kind: 'concept',
      demo: 'Tools',
      title: 'Tools：让模型调用外部能力',
      summary:
        '理解模型如何“动手”：tools/list 发现工具、tools/call 调用工具，每个工具按名称与 JSON Schema 描述，由模型决定何时执行。',
    },
    {
      id: 'mcp-resources',
      kind: 'concept',
      demo: 'Resources',
      title: 'Resources：给模型提供上下文',
      summary:
        '用 URI 标识、由应用决定何时纳入的上下文数据：resources/list、resources/read、资源模板与订阅，以及文本/二进制内容。',
    },
    {
      id: 'mcp-prompts',
      kind: 'concept',
      demo: 'Prompts',
      title: 'Prompts：可复用的提示模板',
      summary:
        '服务器暴露可复用模板与工作流：prompts/list 发现、prompts/get 取回，可带参数、嵌入资源、串联多步，由用户显式选用。',
    },
    {
      id: 'mcp-transports',
      kind: 'concept',
      demo: 'Transports',
      title: 'Transports：客户端与服务器如何通信',
      summary:
        '消息统一为 JSON-RPC 2.0；两种标准传输：本地 stdio 与远程 Streamable HTTP，以及何时选择哪种、如何扩展自定义传输。',
    },
    {
      id: 'mcp-wrapup',
      kind: 'concept',
      demo: 'WrapUp',
      title: '串联完整链路与安全最佳实践',
      summary:
        '把三角色、三大原语与传输串成一次完整会话闭环，并梳理构建与接入时的安全与最佳实践要点，收尾巩固。',
    },
  ],
} as const;

/** 模块学习路径的类型，供落地页与学习路径控件消费。 */
export type McpLearningPath = typeof learningPath;
