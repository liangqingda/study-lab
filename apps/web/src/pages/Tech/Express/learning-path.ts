/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * Express 模块的学习路径配置。
 *
 * 该文件是模块（分类）级的学习总览数据源：`pnpm gen:routes` 检测到本文件存在，
 * 就自动为 `tech/express` 生成「学习路径」落地页与侧边栏入口；
 * 落地页与各 demo 页面的步骤条（DemoLayout 内嵌）会按本文件的步骤顺序渲染。
 *
 * 约定（新增模块时照此填写）：
 * - 文件名固定为 `learning-path.ts`，放在分类目录（如 `pages/Tech/Express/`）下。
 * - 本文件只放字面量数据，不 import 任何模块（生成器与运行时都不解析别名）。
 * - `steps.demo` 对应本分类下的 demo 目录名（如 `Middleware` → `middleware`），
 *   生成器/前端会用它匹配到对应 demo 路由。
 * - `steps` 顺序即推荐学习顺序；步骤数 ≥ 2 时落地页与步骤条才会完整展示路径。
 */
export const learningPath = {
  /** 模块展示名，用作落地页标题与侧边栏「学习路径」入口的文案。 */
  label: 'Express',
  /** 模块整体说明，展示在落地页顶部。 */
  description:
    '理解 Express 如何把一次 HTTP 请求从进入到响应串成一条可预测的链路：先认识中间件组成的执行链，再学会把错误交给统一的错误处理链，最后掌握响应方法如何决定状态码与响应头。按顺序学完，你就能看懂任意 Express 接口的“请求 → 中间件 → 路由 → 响应”。',
  /** 推荐学习步骤，demo 名对应本分类下的 demo 目录名。 */
  steps: [
    {
      demo: 'middleware',
      title: '五类中间件',
      summary:
        '应用级、路由级、错误处理、内置与第三方中间件：用真实请求对照中间件的执行链与响应，建立“请求串行穿过中间件栈”的心智模型。',
    },
    {
      demo: 'error-handling',
      title: '错误处理',
      summary:
        '从错误产生、进入错误处理链，到最终响应或连接中断，逐步对照每条路径，理解同步/异步错误如何被捕获与转发。',
    },
    {
      demo: 'response-methods',
      title: 'Response 方法',
      summary:
        'res.send / res.json / res.status / res.redirect 等响应方法：发送请求观察状态、响应头与响应体，掌握如何把结果正确地交给客户端。',
    },
  ],
} as const;

/** 模块学习路径的类型，供落地页与步骤条消费。 */
export type ExpressLearningPath = typeof learningPath;
