---
name: best-nodejs-code
description: Build production-ready Node.js backend services with Express, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, or microservices architectures.
---

# Node.js Backend Patterns

Comprehensive guidance for building scalable, maintainable, and production-ready Node.js backend applications with modern frameworks, architectural patterns, and best practices.

## When to Use This Skill

- Building REST APIs
- Creating microservices with Node.js
- Implementing authentication and authorization
- Designing scalable backend architectures
- Setting up middleware and error handling
- Integrating databases (SQL and NoSQL)
- Building real-time applications with WebSockets
- Implementing background job processing

## Detailed patterns and worked examples

Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Use TypeScript**: Type safety prevents runtime errors
2. **Implement proper error handling**: Use custom error classes
3. **Validate input**: Use libraries like Zod or Joi
4. **Use environment variables**: Never hardcode secrets
5. **Implement logging**: Use structured logging (Pino, Winston)
6. **Add rate limiting**: Prevent abuse
7. **Use HTTPS**: Always in production
8. **Implement CORS properly**: Don't use `*` in production
9. **Use dependency injection**: Easier testing and maintenance
10. **Write tests**: Unit, integration, and E2E tests
11. **Handle graceful shutdown**: Clean up resources
12. **Use connection pooling**: For databases
13. **Implement health checks**: For monitoring
14. **Use compression**: Reduce response size

## Testing Patterns

See `javascript-testing-patterns` skill for comprehensive testing guidance.

## Workspace Conventions — study-fullstack（后端约定）

以下为本项目 `study-fullstack`（`apps/api`，包名 `study-nodejs`）的代码组织约定，**优先于上方通用规则执行**。来源：仓库 `AGENTS.md`、`.agents/skills/study-demo/SKILL.md`。

### 目录结构

- 将同一 demo 的路由、业务逻辑、模板、示例静态文件放在同一功能目录（遵循后端命名，如 `express/response-methods`），与 Web demo 对应。
- 目录内按职责适度拆分，只有跨 demo 复用的代码放公共目录。

### API 路径契约

- API 路径统一为 `/api/<分类>/<demo>/<动作>` 两层，全用小写 kebab-case；分类是业务域（如 `redis`、`postgres`、`express`），与前端 `pages/<分类>/<demo>`、schema `apis/<分类>/<demo>/`、生成的客户端 `src/apis/<分类>/<demo>.ts` 一一对应。
- 输入用契约（Zod）校验并保持与 schema 一致，不信任裸 `req.body`；前端从同一契约获得类型，避免两端各自维护不一致的手写模型。

### 数据库

- PostgreSQL 统一使用 `study_nodejs` 数据库，以 `DATABASE_URL` 配置连接，不提交真实凭据；不使用旧库或默认 `postgres` 库。
- 建表、迁移或可能修改数据的验证前，确认 `current_database()` 是 `study_nodejs`；不清空或重建已有数据。
- 默认单元测试使用注入或模拟；真实数据库测试需显式启用并限于该库。
- 新表小写 `snake_case`：`demo_<模块名>_<表用途>`（如 `demo_transactions_accounts`），模块名取前端 demo 页面目录最后一级转 snake_case，表用途用业务含义、不以编号作固定后缀。

### 后端质量基线

- 使用 TypeScript 严格类型；输入用 Zod（`safeParse`）校验并保持与契约一致。
- PostgreSQL 用 `pg` 连接池（复用 `src/services/postgres.ts`），不逐请求新建连接；进程退出时优雅关闭池。
- 用自定义错误类区分业务错误（4xx）与意外错误，统一交给全局错误处理器，生产环境不泄露堆栈与细节。
- 结构化日志（pino），记录关键步骤与结果，不记录密码、令牌或连接串。
- 依赖通过参数注入（如 `createSmsLoginRouter(redis)`），便于测试替身，不引入全局单例。

学习 demo 不采用（避免过度工程化）：DI 容器、Repository 分层、统一响应封装（`success/error/paginated` envelope）、限流中间件、JWT 认证体系、WebSocket / 后台任务 / HTTPS / APM。

### 注释 / JSDoc 规范

- 所有提取或共享代码（constants、utils、types、schema 契约、common 模块）必须带 JSDoc 注释。
- 类型级与函数级 JSDoc 用多行块：

```ts
/**
 * Does one thing and returns it.
 */
export const helper = () => {};
```

- 对象类型属性用单行 JSDoc，写在字段上方：

```ts
export type User = {
  /** Unique user id. */
  id: string;
};
```

- 生成文件（如 `packages/schema/types/api-types.ts`）除外。
