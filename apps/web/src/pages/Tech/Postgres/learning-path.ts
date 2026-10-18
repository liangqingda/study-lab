/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * PostgreSQL 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
 */
export const learningPath = {
  label: 'PostgreSQL',
  description:
    '从关系模型和 SQL 开始，进阶到约束、查询、事务、索引与运维，最终能够设计并验证一个小型关系数据库。',
  steps: [
    {
      id: 'postgres-curriculum-relational',
      kind: 'concept',
      title: '关系模型、连接与 SQL 基础',
      summary: '理解表、行、列和数据库会话的基本语义。',
      contentFile: 'notes/relational.md',
    },
    {
      id: 'postgres-curriculum-schema',
      kind: 'concept',
      title: '数据类型、约束与关系设计',
      summary: '把业务不变量写进数据库结构。',
      contentFile: 'notes/schema.md',
    },
    {
      id: 'postgres-curriculum-queries',
      kind: 'concept',
      title: '连接、聚合与子查询',
      summary: '正确表达跨表查询并核对结果基数。',
      contentFile: 'notes/queries.md',
    },
    {
      id: 'postgres-curriculum-advanced-sql',
      kind: 'concept',
      title: '窗口函数、CTE 与集合操作',
      summary: '在保持结果语义清晰的前提下处理复杂分析。',
      contentFile: 'notes/advanced-sql.md',
    },
    {
      id: 'postgres-curriculum-transactions',
      kind: 'concept',
      title: '事务、MVCC 与并发控制',
      summary: '通过会话时序理解一致性和冲突。',
      contentFile: 'notes/transactions.md',
    },
    {
      id: 'postgres-curriculum-indexes',
      kind: 'concept',
      title: '索引、执行计划与查询优化',
      summary: '根据访问路径和数据分布判断索引是否有用。',
      contentFile: 'notes/indexes.md',
    },
    {
      id: 'postgres-curriculum-operations',
      kind: 'concept',
      title: '迁移、权限、备份与日常维护',
      summary: '理解数据库可恢复性和运行成本。',
      contentFile: 'notes/operations.md',
    },
    {
      id: 'postgres-curriculum-project',
      kind: 'lab',
      title: '综合实践：订单数据库设计审阅',
      summary: '把模型、并发、性能和恢复串成闭环。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
