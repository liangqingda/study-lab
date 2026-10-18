/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * PostgreSQL 独立技术学习大纲；阶段由知识依赖与能力目标设计，与 Demo 清单无关联。
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
      content:
        '## 学习目标\n\n理解表、行、列和数据库会话的基本语义。\n\n## 前置知识\n\n已具备该技术所需的入门背景。\n\n## 核心知识与学习顺序\n\n1. 表表达一类关系，行是记录，列有明确类型；结果没有 ORDER BY 就不保证顺序。\n\n2. 区分数据库、schema 与表；认识客户端会话、连接和权限。学习 SELECT、WHERE、ORDER BY 与 LIMIT。\n\n## 独立练习\n\n在纸上设计作者与文章的两张表，用只读查询表达筛选、排序与分页需求。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能说明每行代表什么，并区分数据库对象层级与查询结果。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-schema',
      kind: 'concept',
      title: '数据类型、约束与关系设计',
      summary: '把业务不变量写进数据库结构。',
      content:
        '## 学习目标\n\n把业务不变量写进数据库结构。\n\n## 前置知识\n\n先完成「关系模型、连接与 SQL 基础」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 选择整数、数值、文本、布尔、日期时间与 JSON 类型时考虑语义、精度和查询方式。\n\n2. 主键标识记录，外键维护引用关系，UNIQUE、NOT NULL、CHECK 限制合法状态；NULL 表示未知，比较遵循三值逻辑。\n\n## 独立练习\n\n设计订单、订单项与商品关系，列出金额、数量、唯一性和引用完整性约束。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能说明哪些非法状态会被约束拒绝，以及删除关联数据时的行为。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-queries',
      kind: 'concept',
      title: '连接、聚合与子查询',
      summary: '正确表达跨表查询并核对结果基数。',
      content:
        '## 学习目标\n\n正确表达跨表查询并核对结果基数。\n\n## 前置知识\n\n先完成「数据类型、约束与关系设计」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 学习 INNER/LEFT JOIN 的匹配与补空，避免把过滤条件放错位置改变外连接含义。\n\n2. GROUP BY 聚合多行，HAVING 过滤分组；子查询和 EXISTS 表达存在性，不能用 DISTINCT 掩盖错误连接。\n\n## 独立练习\n\n给两张小表手算连接行数，查询每位作者的文章数并保留没有文章的作者。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释重复与 NULL 的来源，并区分 WHERE 与 HAVING 的执行含义。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-advanced-sql',
      kind: 'concept',
      title: '窗口函数、CTE 与集合操作',
      summary: '在保持结果语义清晰的前提下处理复杂分析。',
      content:
        '## 学习目标\n\n在保持结果语义清晰的前提下处理复杂分析。\n\n## 前置知识\n\n先完成「连接、聚合与子查询」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 窗口函数在不折叠原始行的前提下计算分组排名和累计值；窗口排序不保证最终输出顺序。\n\n2. CTE 为复杂查询命名，递归 CTE 处理层级关系；UNION 与 UNION ALL 的去重成本和语义不同。\n\n## 独立练习\n\n计算每个分类销量前两名及累计销量，用 CTE 拆分并核对中间结果。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n解释并列排名与窗口范围，能验证结果不因重复行而误算。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-transactions',
      kind: 'concept',
      title: '事务、MVCC 与并发控制',
      summary: '通过会话时序理解一致性和冲突。',
      content:
        '## 学习目标\n\n通过会话时序理解一致性和冲突。\n\n## 前置知识\n\n先完成「窗口函数、CTE 与集合操作」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 事务的提交和回滚划定原子操作边界；MVCC 通过版本与快照支持并发读取，不代表任何读写都不加锁。\n\n2. 比较隔离级别、行锁、死锁和序列化失败；重试应覆盖整个事务并保持幂等，事务不要等待用户交互。\n\n## 独立练习\n\n绘制两个会话同时转账或扣库存的时间线，标注读、写、提交与等待点。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释丢失更新的防护方案，失败后保证余额或库存不变量成立。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-indexes',
      kind: 'concept',
      title: '索引、执行计划与查询优化',
      summary: '根据访问路径和数据分布判断索引是否有用。',
      content:
        '## 学习目标\n\n根据访问路径和数据分布判断索引是否有用。\n\n## 前置知识\n\n先完成「事务、MVCC 与并发控制」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. B-tree 适用于许多等值和范围查询，但索引有写入和存储成本；复合索引应结合过滤、排序与选择性设计。\n\n2. EXPLAIN 展示估算计划，EXPLAIN ANALYZE 会实际执行语句；估算行数、实际行数、循环次数和缓冲命中需要结合阅读。\n\n## 独立练习\n\n为订单按用户与创建时间查询设计候选索引，比较过滤条件和排序是否匹配。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释顺序扫描可能更合理的原因；知道 ANALYZE 与统计信息会影响计划。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-operations',
      kind: 'concept',
      title: '迁移、权限、备份与日常维护',
      summary: '理解数据库可恢复性和运行成本。',
      content:
        '## 学习目标\n\n理解数据库可恢复性和运行成本。\n\n## 前置知识\n\n先完成「索引、执行计划与查询优化」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 迁移应可审查、可分阶段部署并评估锁影响；最小权限区分应用角色与管理角色。\n\n2. VACUUM 处理死元组，ANALYZE 更新统计；理解 WAL、检查点、逻辑备份与物理备份的不同恢复边界。\n\n## 独立练习\n\n编写新增非空列的分阶段迁移方案，并设计备份后在隔离环境恢复的演练清单。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能说明备份如何证明可恢复，迁移如何避免长时间阻塞业务。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
    {
      id: 'postgres-curriculum-project',
      kind: 'lab',
      title: '综合实践：订单数据库设计审阅',
      summary: '把模型、并发、性能和恢复串成闭环。',
      content:
        '## 学习目标\n\n把模型、并发、性能和恢复串成闭环。\n\n## 前置知识\n\n先完成「迁移、权限、备份与日常维护」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 先声明业务不变量和查询需求，再设计关系、约束、事务和索引；优化以可测量问题为依据。\n\n2. 生产数据验证与教学实验分开。此仓库任何实际写入前必须确认 current_database() 为 study_lab，不能清空已有数据。\n\n## 独立练习\n\n交付订单模型、核心查询、并发时间线、索引依据、迁移与恢复方案。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n每项约束有非法输入示例，每项优化有计划证据，每个写入操作有明确的事务边界。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[PostgreSQL 官方学习资料](https://www.postgresql.org/docs/current/tutorial.html)\n',
    },
  ],
} as const;
