## 1. 索引是一条有成本的访问路径

索引帮助数据库更快定位候选记录或按某种顺序访问，代价是存储、写入维护与缓存占用。不是建了索引就必用，也不是 Seq Scan 必然慢。选择性、表大小、统计信息、缓存和预计返回行数都会影响计划。

本节以 PostgreSQL 18 为基线。EXPLAIN 给出估算计划；EXPLAIN ANALYZE 会实际执行。对 UPDATE/DELETE 等使用 ANALYZE 时，即使随后回滚，外部副作用也未必能撤销，不能在现有业务数据上随意试。

## 2. 读懂计划的最小词汇

| 字段/节点  | 含义                       | 容易误读                         |
| ---------- | -------------------------- | -------------------------------- |
| cost       | 优化器相对成本单位         | 不是毫秒                         |
| rows       | 每次节点预计/实际输出行数  | 结合 loops 才理解累计工作        |
| Index Cond | 索引用来缩小访问范围的条件 | 不等于所有 Filter 都被索引解决   |
| Filter     | 访问后继续筛选             | 丢弃很多行可能说明访问路径不匹配 |
| Buffers    | 块访问和命中信息           | 命中缓存也有 CPU 成本            |

复合 B-tree 索引应结合等值、范围、排序及数据分布设计；最左前缀是有用起点，但现代版本的跳跃扫描等能力使“不是第一列就绝对不能用”过于武断。以实际计划和版本为准。

## 3. 完整可回滚实验

先预测：user_id 精确匹配并按 created_at 倒序取 10 条，哪种复合索引更接近需求？保存 `indexes.sql`：

```sql
\set ON_ERROR_STOP on
SELECT current_database()='study_lab' AS correct_db \gset
\if :correct_db
\else
  \quit
\endif
BEGIN;
CREATE TEMP TABLE demo_learning_path_orders AS
SELECT i AS id,(i%1000) AS user_id,
  timestamp '2025-01-01' + i*interval '1 second' AS created_at
FROM generate_series(1,100000) AS g(i);
ANALYZE demo_learning_path_orders;
EXPLAIN (ANALYZE,BUFFERS)
SELECT id,created_at FROM demo_learning_path_orders WHERE user_id=42 ORDER BY created_at DESC LIMIT 10;
CREATE INDEX ON demo_learning_path_orders(user_id,created_at DESC);
ANALYZE demo_learning_path_orders;
EXPLAIN (ANALYZE,BUFFERS)
SELECT id,created_at FROM demo_learning_path_orders WHERE user_id=42 ORDER BY created_at DESC LIMIT 10;
ROLLBACK;
```

用 psql 执行。预期有索引后可能采用能按目标顺序读取的索引访问，减少需要扫描和排序的数据；**不承诺固定节点名称或耗时**，计划受环境与版本影响。记录前后计划，观察 Filter、排序、实际行数和缓冲块，而不是只截一个总毫秒数。

## 4. 如何判断是否真的改善

先确认语义和返回行数相同，再看访问工作是否减少；重复运行会受缓存暖化影响，应说明测量条件。对返回大部分表的查询，顺序扫描可能更经济；索引很多还会拖慢 INSERT/UPDATE。

索引只读扫描需要相关数据可从索引取得并符合可见性检查条件；“把字段放进索引”不等于一定完全不访问堆表。表达式索引、部分索引与查询谓词需要匹配，不能靠名称相似推断可用。

## 5. 错误驱动

错误场景是 WHERE 对列施加函数或不匹配的类型转换，已有普通索引不再像预期那样使用。先检查表达式、参数类型和排序要求；必要时调整查询或按实际使用建立表达式索引，而不是全局关闭顺序扫描。

统计信息过旧可能让估算行数严重偏离实际；ANALYZE 更新统计，不是清理死元组的替代。生产建索引还需评估锁与并发构建限制，本实验临时表上的普通 CREATE INDEX 不代表线上无影响。

## 6. 练习与验收

1. 查询改成不筛 user_id 只按时间排序，验收解释为什么原复合索引未必最合适。
2. 对比选择性高与低的过滤条件，验收分别记录估算/实际行数和采用的节点。
3. 为一个真实查询提出索引候选，只做审阅或隔离验证；验收同时说明读收益、写代价和部署影响。

## 7. 资料链接

- [PostgreSQL：EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html)
- [PostgreSQL：多列索引](https://www.postgresql.org/docs/18/indexes-multicolumn.html)
- [PostgreSQL：索引类型](https://www.postgresql.org/docs/18/indexes-types.html)
