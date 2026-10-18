/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * Express 模块的学习路径（教学大纲）。
 *
 * 这是模块级的学习总览数据源：`pnpm gen:routes` 检测到本文件存在，就自动为
 * `tech/express` 生成「学习路径」落地页与侧边栏入口；落地页与 demo 页顶部的
 * 学习路径控件按本文件的步骤顺序渲染。
 *
 * 关键约定（区别于“demo 列表”）：
 * - `steps` 是**设计的教学路径**，不是 demo 目录的机械平铺：应有概念铺垫、
 *   动手实验与总结收尾，每步粒度按“这一模块该怎么学”来定，而非“有哪些 demo”。
 * - 每步 `kind`：`concept`（概念/讲解，通常不关联 demo）或 `lab`（动手实验，
 *   通常关联一个 demo）。纯概念步骤不写 `demo`，只在落地页展示与标记。
 * - 每步 `id` 必须稳定且唯一，作为完成状态与熟练度的本地存储 key。
 * - `demo` 对应本分类下的 demo 目录名（kebab-case，如 `Middleware` → `middleware`），
 *   仅 `lab` 步骤填写；前端用它推导出“开始学习”进入的 demo 路由。
 * - 本文件只放字面量数据，不 `import` 任何模块。
 */
export const learningPath = {
  /** 模块展示名，用作落地页标题与侧边栏「学习路径」入口的文案。 */
  label: 'Express',
  /** 模块整体说明，展示在落地页顶部。 */
  description:
    '理解 Express 如何把一次 HTTP 请求从进入到响应串成一条可预测的链路。路径按“先建立心智模型 → 逐个动手实验 → 最后串成完整闭环”设计：先认识请求处理模型，再通过三个实验掌握中间件、错误处理与响应方法，最后总结常见误区与排查思路。',
  /** 推荐学习步骤（教学路径，非 demo 列表）。 */
  steps: [
    {
      id: 'express-intro',
      kind: 'concept',
      title: '认识 Express 与请求处理模型',
      summary:
        '先建立整体心智模型：Express 是什么、一个请求如何从进入到响应，app / req / res 三者各管什么，为后面的实验铺垫共同语言。',
    },
    {
      id: 'middleware',
      kind: 'lab',
      demo: 'middleware',
      title: '中间件机制',
      summary:
        '动手实验五类中间件，用真实请求对照中间件的执行链与响应，建立“请求串行穿过中间件栈”的心智模型。',
    },
    {
      id: 'error-handling',
      kind: 'lab',
      demo: 'error-handling',
      title: '错误处理',
      summary:
        '从错误产生、进入错误处理链，到最终响应或连接中断，逐步对照每条路径，理解同步/异步错误如何被捕获与转发。',
    },
    {
      id: 'response-methods',
      kind: 'lab',
      demo: 'response-methods',
      title: 'Response 方法',
      summary:
        '动手实验 res.send / res.json / res.status / res.redirect 等响应方法，发送请求观察状态、响应头与响应体，掌握如何把结果正确地交给客户端。',
    },
    {
      id: 'express-wrapup',
      kind: 'concept',
      title: '串联完整链路与排查',
      summary:
        '把请求链、中间件、错误处理、响应方法串成一个完整闭环，梳理常见误区与“请求不返回/返回异常”时的排查思路，收尾巩固。',
    },
  ],
} as const;

/** 模块学习路径的类型，供落地页与学习路径控件消费。 */
export type ExpressLearningPath = typeof learningPath;
