/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * MCP 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
 */
export const learningPath = {
  label: 'MCP',
  description:
    '按协议定位、参与角色、会话生命周期、能力原语、传输、授权与实现验证学习 MCP，目标是能设计并审查一次完整集成。',
  steps: [
    {
      id: 'mcp-curriculum-purpose',
      kind: 'concept',
      title: '协议定位与上下文边界',
      summary: '理解 MCP 解决的集成问题与不负责的部分。',
      contentFile: 'notes/purpose.md',
    },
    {
      id: 'mcp-curriculum-architecture',
      kind: 'concept',
      title: 'Host、Client、Server 与请求生命周期',
      summary: '理解角色边界、新旧版本模型与请求如何关联。',
      contentFile: 'notes/architecture.md',
    },
    {
      id: 'mcp-curriculum-primitives',
      kind: 'concept',
      title: 'Tools、Resources 与 Prompts',
      summary: '用控制权和输入输出区分三类能力。',
      contentFile: 'notes/primitives.md',
    },
    {
      id: 'mcp-curriculum-transport',
      kind: 'concept',
      title: '本地与远程传输、连接与恢复',
      summary: '把协议消息与承载方式分开理解。',
      contentFile: 'notes/transport.md',
    },
    {
      id: 'mcp-curriculum-security',
      kind: 'concept',
      title: '授权、信任边界与输入输出安全',
      summary: '防止把接入能力误当作用户授权。',
      contentFile: 'notes/security.md',
    },
    {
      id: 'mcp-curriculum-implementation',
      kind: 'concept',
      title: '实现能力、契约与错误语义',
      summary: '设计可验证、可维护的协议服务。',
      contentFile: 'notes/implementation.md',
    },
    {
      id: 'mcp-curriculum-extensions',
      kind: 'concept',
      title: '可选能力、交互扩展与兼容性',
      summary: '按实际需求渐进引入更复杂的能力。',
      contentFile: 'notes/extensions.md',
    },
    {
      id: 'mcp-curriculum-project',
      kind: 'lab',
      title: '综合实践：集成设计与兼容性审阅',
      summary: '串联发现、调用、失败与安全验证。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
