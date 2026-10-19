/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * AI Agent 应用开发学习路径，按知识依赖组织，正文与 Demo 独立。
 */
export const learningPath = {
  label: 'AI Agent',
  description:
    '以 TypeScript / Node.js 为主线，从模型 API、工具调用和 Agent 循环，逐步学习上下文、RAG、任务编排、评估与安全部署，最终完成可验证的多步任务助手。',
  steps: [
    {
      id: 'ai-agent-curriculum-foundations',
      kind: 'concept',
      title: '开发基础与 Agent 的能力边界',
      summary: '补齐异步、HTTP、JSON 和状态管理，区分对话、工作流与 Agent。',
      contentFile: 'notes/foundations.md',
    },
    {
      id: 'ai-agent-curriculum-model-api',
      kind: 'concept',
      title: '大模型 API、多轮消息与流式响应',
      summary: '理解 Token、上下文、结束原因、费用和模型调用的失败边界。',
      contentFile: 'notes/model-api.md',
    },
    {
      id: 'ai-agent-curriculum-structured-output',
      kind: 'concept',
      title: '提示词、结构化输出与运行时校验',
      summary: '用清晰指令、示例和数据契约，把模型输出变成可处理的业务输入。',
      contentFile: 'notes/structured-output.md',
    },
    {
      id: 'ai-agent-curriculum-tools',
      kind: 'concept',
      title: '工具设计与 Function Calling',
      summary: '设计工具参数、结果和错误语义，在应用执行前校验权限与输入。',
      contentFile: 'notes/tools.md',
    },
    {
      id: 'ai-agent-curriculum-agent-loop',
      kind: 'concept',
      title: 'Agent 循环、反馈与停止条件',
      summary: '实现观察、决策、执行与再决策，控制步数、重复调用和异常恢复。',
      contentFile: 'notes/agent-loop.md',
    },
    {
      id: 'ai-agent-curriculum-context-memory',
      kind: 'concept',
      title: '上下文工程、会话状态与长期记忆',
      summary: '按任务选择信息，管理预算、摘要、记忆隔离与生命周期。',
      contentFile: 'notes/context-memory.md',
    },
    {
      id: 'ai-agent-curriculum-retrieval',
      kind: 'concept',
      title: '知识检索、Embedding 与 RAG',
      summary: '串联文档处理、混合检索、重排序、证据引用与无依据时的处理。',
      contentFile: 'notes/retrieval.md',
    },
    {
      id: 'ai-agent-curriculum-workflows',
      kind: 'concept',
      title: '任务编排、检查点与人工介入',
      summary: '用明确状态组织分支、并行、暂停恢复和有副作用的操作。',
      contentFile: 'notes/workflows.md',
    },
    {
      id: 'ai-agent-curriculum-integrations',
      kind: 'concept',
      title: 'MCP、框架与多智能体的使用时机',
      summary: '分清能力接入、执行编排与任务分工，建立受约束的交接契约。',
      contentFile: 'notes/integrations.md',
    },
    {
      id: 'ai-agent-curriculum-evaluations',
      kind: 'concept',
      title: '评估集、执行轨迹与回归验证',
      summary: '用任务成功率、安全约束、引用质量、延迟和成本衡量实际效果。',
      contentFile: 'notes/evaluations.md',
    },
    {
      id: 'ai-agent-curriculum-production',
      kind: 'concept',
      title: '权限、安全防护与生产部署',
      summary:
        '处理提示注入、超时重试、幂等、数据隔离、密钥和任务运行生命周期。',
      contentFile: 'notes/production.md',
    },
    {
      id: 'ai-agent-curriculum-project',
      kind: 'lab',
      title: '综合实践：可验证的多步任务助手',
      summary:
        '组合三个工具、反馈循环、证据校验和失败用例，再逐步替换真实依赖。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
