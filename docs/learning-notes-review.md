# 学习路径详细笔记评审记录

评审日期：2026-10-18。目标：自学与动手训练。范围为六个技术模块的 48 个专题阶段；完整性逐篇在该阶段标题内部评估，不以其他阶段知识缺失判为本篇问题。阶段 ID 保持稳定，Demo 不作为必修项目。

使用 [take-notes](/Users/lqd/projects/ai-skills/take-notes/SKILL.md) 编写，并按 [review-note](/Users/lqd/projects/ai-skills/review-note/SKILL.md) 执行两轮评审与对应修补，未进行第三轮。采用前端、后端/数据、安全与 SRE 四类视角：L1 检查范围，L2 检查可操作深度，L3 检查失败与运行边界，L4 核对版本与事实。每层切换视角，问题收敛后原位修补。

## 1. 覆盖地图

深浅档位指笔记呈现的内容，不代表读者已完成练习或系统已通过生产认证。48 篇均包含术语、机制、具体示例及结果、错误/边界和主动练习；下表区分实际运行与未执行环境。

| 模块与笔记 | 呈现深度 | 示例验证范围 |
| --- | --- | --- |
| [CSS：语法、选择器与开发工具](../apps/web/src/pages/Tech/Css/notes/syntax.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：层叠、优先级与继承](../apps/web/src/pages/Tech/Css/notes/cascade.md) | 踩过坑 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：盒模型、单位与尺寸计算](../apps/web/src/pages/Tech/Css/notes/sizing.md) | 踩过坑 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：正常流、定位与层叠上下文](../apps/web/src/pages/Tech/Css/notes/flow.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：Flexbox 与 Grid 布局](../apps/web/src/pages/Tech/Css/notes/flex-grid.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：响应式、排版与可访问性](../apps/web/src/pages/Tech/Css/notes/responsive.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：动画、组织方式与性能排查](../apps/web/src/pages/Tech/Css/notes/motion-maintenance.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [CSS：综合实践：跨屏内容页面](../apps/web/src/pages/Tech/Css/notes/project.md) | 会用 | Chrome 执行完整 HTML；正文与目录渲染 |
| [HTTP：资源、URL 与请求响应模型](../apps/web/src/pages/Tech/Http/notes/model.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：消息结构、方法与状态码](../apps/web/src/pages/Tech/Http/notes/messages.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：连接、TLS 与协议版本](../apps/web/src/pages/Tech/Http/notes/connections.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：表示、协商与流式传输](../apps/web/src/pages/Tech/Http/notes/representations.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：缓存、新鲜度与条件请求](../apps/web/src/pages/Tech/Http/notes/caching.md) | 踩过坑 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：Cookie、会话与浏览器跨源安全](../apps/web/src/pages/Tech/Http/notes/browser-security.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：代理、超时、重试与可观测性](../apps/web/src/pages/Tech/Http/notes/reliability.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [HTTP：综合实践：解释一次真实请求](../apps/web/src/pages/Tech/Http/notes/project.md) | 会用 | Node HTTP/控制流实验；正文与图示渲染 |
| [Express：Node.js 与 Express 请求模型](../apps/web/src/pages/Tech/Express/notes/foundations.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：路由、参数与 Router](../apps/web/src/pages/Tech/Express/notes/routing.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：中间件执行与请求边界](../apps/web/src/pages/Tech/Express/notes/middleware.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：输入校验、响应设计与权限边界](../apps/web/src/pages/Tech/Express/notes/validation.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：异步错误与统一错误处理](../apps/web/src/pages/Tech/Express/notes/errors.md) | 踩过坑 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：数据访问、分层与外部依赖](../apps/web/src/pages/Tech/Express/notes/data-services.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：测试、安全配置与可观测性](../apps/web/src/pages/Tech/Express/notes/testing-security.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [Express：综合实践：交付一个可维护服务](../apps/web/src/pages/Tech/Express/notes/project.md) | 会用 | 真实 HTTP 或依赖替身断言；正文渲染 |
| [PostgreSQL：关系模型、连接与 SQL 基础](../apps/web/src/pages/Tech/Postgres/notes/relational.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：数据类型、约束与关系设计](../apps/web/src/pages/Tech/Postgres/notes/schema.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：连接、聚合与子查询](../apps/web/src/pages/Tech/Postgres/notes/queries.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：窗口函数、CTE 与集合操作](../apps/web/src/pages/Tech/Postgres/notes/advanced-sql.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：事务、MVCC 与并发控制](../apps/web/src/pages/Tech/Postgres/notes/transactions.md) | 踩过坑 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：索引、执行计划与查询优化](../apps/web/src/pages/Tech/Postgres/notes/indexes.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：迁移、权限、备份与日常维护](../apps/web/src/pages/Tech/Postgres/notes/operations.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [PostgreSQL：综合实践：订单数据库设计审阅](../apps/web/src/pages/Tech/Postgres/notes/project.md) | 会用 | SQL 与结果/时序逐项审阅；未连接真实数据库 |
| [Redis：键空间、命令与过期语义](../apps/web/src/pages/Tech/Redis/notes/model.md) | 会用 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：核心数据结构与场景选择](../apps/web/src/pages/Tech/Redis/notes/structures.md) | 会用 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：原子命令、流水线与脚本](../apps/web/src/pages/Tech/Redis/notes/atomicity.md) | 踩过坑 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：缓存模式、一致性与故障策略](../apps/web/src/pages/Tech/Redis/notes/caching.md) | 踩过坑 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：限流、锁与消息处理](../apps/web/src/pages/Tech/Redis/notes/coordination.md) | 踩过坑 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：RDB、AOF 与故障恢复](../apps/web/src/pages/Tech/Redis/notes/durability.md) | 会用 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [Redis：复制、Sentinel、Cluster 与性能](../apps/web/src/pages/Tech/Redis/notes/scaling.md) | 会用 | 复制/槽与故障语义核对；未运行 Sentinel/Cluster 故障切换 |
| [Redis：综合实践：设计可降级缓存服务](../apps/web/src/pages/Tech/Redis/notes/project.md) | 会用 | 隔离实例的对应命令/脚本或 Node 替身；正文渲染 |
| [MCP：协议定位与上下文边界](../apps/web/src/pages/Tech/Mcp/notes/purpose.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：Host、Client、Server 与请求生命周期](../apps/web/src/pages/Tech/Mcp/notes/architecture.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：Tools、Resources 与 Prompts](../apps/web/src/pages/Tech/Mcp/notes/primitives.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：本地与远程传输、连接与恢复](../apps/web/src/pages/Tech/Mcp/notes/transport.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：授权、信任边界与输入输出安全](../apps/web/src/pages/Tech/Mcp/notes/security.md) | 踩过坑 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：实现能力、契约与错误语义](../apps/web/src/pages/Tech/Mcp/notes/implementation.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：可选能力、交互扩展与兼容性](../apps/web/src/pages/Tech/Mcp/notes/extensions.md) | 踩过坑 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |
| [MCP：综合实践：集成设计与兼容性审阅](../apps/web/src/pages/Tech/Mcp/notes/project.md) | 会用 | Node 核心/状态机或 stdio 实验；未做第三方 SDK 互通认证 |

## 2. 缺口、影响和修补

| 轮次 | 优先级 | 层次 | 缺口 | 为什么要修 | 补什么/如何修 | 证据与位置 |
| --- | --- | --- | --- | --- | --- | --- |
| 第一轮 | P0 | L4 | Redis WAIT 与写入分属不同 CLI 连接 | 确认的不是目标写入偏移，会误导耐久性判断 | 改为同一连接执行 SET 与 WAIT | Redis scaling.md；官方 WAIT/复制语义 |
| 第一轮 | P0 | L4 | MCP Sampling 未标弃用 | 把旧能力推荐给 2026 新实现 | 明确 2026-07-28 弃用及迁移方向 | Mcp extensions.md；官方 Sampling 规范 |
| 第一轮 | P1 | L3 | 持久化演练目录可能重用 | 可能把旧文件误认为本次结果 | 用 mktemp 创建全新目录并说明重启复用该路径 | Redis durability.md |
| 第一轮 | P1 | L3 | 配置模块缓存可能使 Markdown 修改不生效 | 正文更新后仍显示旧笔记 | 读取配置后 structuredClone，新增同配置二次读取回归测试 | gen-routes.mjs 与 gen-routes.test.mjs |
| 第二轮 | P1 | L1/L2 | 正常流内的 margin 折叠与格式化上下文薄弱 | 只讲定位不足以覆盖正常流范围 | 补充父子折叠、flow-root、Flex/Grid 边界与可观察片段 | Css flow.md |
| 第二轮 | P1 | L2/L3 | 运维缺可复现恢复过程和权限操作边界 | 只介绍备份名词不足以指导演练 | 补隔离容器逻辑备份/恢复、权限检查；明确未执行该容器实验 | Postgres operations.md |
| 第二轮 | P1 | L2 | MCP 实现只有本地分发核心 | 不能展示标准方法经过真实 stdio 的执行 | 补 discover/list/call 子集服务与客户端，执行并断言；声明非完整生产 SDK | Mcp implementation.md |
| 第二轮 | P2 | L3 | 长笔记章节跳转可能被固定头部覆盖 | 能跳转但标题不可见 | 给标题设置 scroll-margin-top，阅读器生成编号目录 | ConceptPageLayout/index.scss 与 LearningMarkdown |

上述八项已修补。没有将未执行的外部环境测试写成已通过；这些是验证边界，仍保留在笔记对应章节。

## 3. 各角色结论

- 前端：CSS 示例不依赖项目 Demo，包含缩放、键盘、内容压力与动态偏好；阅读器提供目录、局部滚动及图示文本回退。
- 后端/数据：区分消息格式、业务契约、事务与缓存一致性。查询样本包含 NULL、并列和连接基数；并发例子说明会话、等待与提交点。
- 安全：认证、资源授权、凭据受众与不可信内容分开解释。MCP 教学子集不宣称生产协议完整；不把假令牌检查或模型意图当授权。
- SRE：演练仅使用本次隔离实例，说明正常重启不等于断电保证，副本不等于备份；清理只针对本次拥有的进程/对象。

## 4. 验证证据

- `node apps/web/scripts/check-learning-notes.mjs`：48 篇结构、编号、实验/结果、边界、练习和来源检查；16 个 Mermaid 围栏。
- `node --test apps/web/scripts/gen-routes.test.mjs`：13 项生成器测试，包括笔记修改后重新加载、缺失文件和越界文件拒绝。
- Node/Express：29 段初始 JavaScript 语法检查，14 个独立程序与 12 个 HTTP 实验通过；后补的 MCP 标准方法 stdio 客户端/服务端单独执行通过。
- CSS：8 个完整 HTML 实验在 Chrome 核对颜色、宽度、布局、展开与筛选。
- Redis：专用临时目录、仅 Unix socket、无 TCP 端口；TTL、结构、扣减、限流、安全释放锁、Streams 确认、RDB 与 AOF 重启通过。相关进程均由验证脚本结束。
- 浏览器：48 篇逐篇打开，目录锚点存在，16 张图实际生成 SVG；390px 窄屏与阶段进度同步通过，无未捕获运行时异常。
- PostgreSQL 未连接真实库；Docker 恢复、双会话并发、Redis 多节点切换及第三方 MCP SDK/客户端互通未实际执行，笔记明确区分推导、隔离例子与实测。

## 5. 后续内容验收

1. 新笔记继续使用独立 Markdown，先按主题完整度设计内容，再放完整实验，不能套用简介或同一泛化示例。
2. 先预测、再运行、再解释决定性结果；多会话用时序表，术语首次出现附近解释。
3. 版本变化先查官方资料；特别是 MCP 的 modern/legacy 代际不能混写。
4. 结构检查不代替语义评审；每篇按专题边界复核，并把未运行环境写清楚。

## 6. 资料链接

每篇正文末尾保留对应官方资料，涉及当前行为的重点核验来源包括：

- [MDN：层叠顺序](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction)
- [MDN：HTTP 缓存](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [Express：错误处理](https://expressjs.com/en/guide/error-handling.html)
- [PostgreSQL 18：事务隔离](https://www.postgresql.org/docs/18/transaction-iso.html)
- [Redis：事务](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [MCP：版本与兼容](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)
- [MCP：Sampling 弃用说明](https://modelcontextprotocol.io/specification/2026-07-28/client/sampling)

[查看评审总览图](learning-notes-review.html)
