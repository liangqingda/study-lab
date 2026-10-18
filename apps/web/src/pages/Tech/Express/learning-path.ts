/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * Express 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
 */
export const learningPath = {
  label: 'Express',
  description:
    '以前置 JavaScript、Node.js 和 HTTP 知识为基础，从路由与中间件学习到输入边界、错误处理、测试及部署。',
  steps: [
    {
      id: 'express-curriculum-foundations',
      kind: 'concept',
      title: 'Node.js 与 Express 请求模型',
      summary: '先理解运行环境，再理解框架处理一次请求的过程。',
      contentFile: 'notes/foundations.md',
    },
    {
      id: 'express-curriculum-routing',
      kind: 'concept',
      title: '路由、参数与 Router',
      summary: '把 URL 与处理器组织成清晰的资源边界。',
      contentFile: 'notes/routing.md',
    },
    {
      id: 'express-curriculum-middleware',
      kind: 'concept',
      title: '中间件执行与请求边界',
      summary: '掌握顺序、终止、转交和资源清理。',
      contentFile: 'notes/middleware.md',
    },
    {
      id: 'express-curriculum-validation',
      kind: 'concept',
      title: '输入校验、响应设计与权限边界',
      summary: '将不可信输入变为明确的业务参数。',
      contentFile: 'notes/validation.md',
    },
    {
      id: 'express-curriculum-errors',
      kind: 'concept',
      title: '异步错误与统一错误处理',
      summary: '确保每条失败路径都能被观察和正确结束。',
      contentFile: 'notes/errors.md',
    },
    {
      id: 'express-curriculum-data-services',
      kind: 'concept',
      title: '数据访问、分层与外部依赖',
      summary: '在业务边界内组织异步数据操作。',
      contentFile: 'notes/data-services.md',
    },
    {
      id: 'express-curriculum-testing-security',
      kind: 'concept',
      title: '测试、安全配置与可观测性',
      summary: '用证据保证接口行为及运行边界。',
      contentFile: 'notes/testing-security.md',
    },
    {
      id: 'express-curriculum-project',
      kind: 'lab',
      title: '综合实践：交付一个可维护服务',
      summary: '完成从启动到优雅退出的服务闭环。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
