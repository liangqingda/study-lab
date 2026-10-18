## 1. 查询正确性首先是行数正确

JOIN 把行按条件组合，GROUP BY 再把若干行汇总。很多报表错误不来自 SQL 语法，而来自把一对多关系误当一对一，或者在 LEFT JOIN 后的 WHERE 中过滤掉补 NULL 的行。

实验基于 PostgreSQL 18，使用 VALUES 内联数据，不写任何表。先手算再执行，比直接看复杂查询输出更容易建立可靠直觉。

## 2. 三组核心概念

| 概念                  | 语义                          | 示例                           |
| --------------------- | ----------------------------- | ------------------------------ |
| INNER JOIN            | 只保留匹配组合                | 没文章的作者消失               |
| LEFT JOIN             | 保留左侧行，不匹配部分补 NULL | 没文章的作者仍出现             |
| WHERE / HAVING        | 过滤行 / 过滤分组             | views 条件与文章数条件不同     |
| COUNT(*) / COUNT(col) | 计行 / 计非 NULL 值           | 外连接补空行也算在 COUNT(*) 内 |
| EXISTS                | 判断是否存在匹配行            | 不把每个匹配都展开为结果行     |

## 3. 完整实验：没有文章的作者也要显示

先预测：作者 B 的 COUNT(*) 和 COUNT(p.id) 分别是多少？保存 `queries.sql` 并用 psql 执行：

```sql
WITH authors(id,name) AS (VALUES (1,'A'),(2,'B')),
posts(id,author_id,published) AS (VALUES (10,1,true),(11,1,false))
SELECT a.id,a.name,count(*) AS joined_rows,count(p.id) AS posts
FROM authors a
LEFT JOIN posts p ON p.author_id=a.id AND p.published=true
GROUP BY a.id,a.name
ORDER BY a.id;
```

| 作者 | joined_rows | posts | 为什么                 |
| ---- | ----------- | ----- | ---------------------- |
| A    | 1           | 1     | 只有已发布文章进入匹配 |
| B    | 1           | 0     | 保留了补 NULL 的左侧行 |

把 `p.published=true` 从 ON 移到 WHERE，B 的 NULL 条件不是 true，会被过滤掉。这是查询语义改变，不是优化器随机行为。COUNT(p.id) 利用 id 不为 NULL 的约束来计实际匹配文章，COUNT(*) 只知道有一行结果。

## 4. 一对多叠加为什么重复计算

若作者同时关联两篇文章和三个标签，直接连接可能得到六行，再 SUM(views) 就重复累计文章。DISTINCT 有时掩盖现象，却不一定修正口径。应先把各子集合按作者聚合，再 JOIN；如果只需要“有文章”，使用 EXISTS 避免展开。

```sql
WITH authors(id,name) AS (VALUES (1,'A'),(2,'B')),
posts(id,author_id) AS (VALUES (10,1),(11,1))
SELECT a.name FROM authors a
WHERE EXISTS (SELECT 1 FROM posts p WHERE p.author_id=a.id);
```

结果只有 A 一行，即使 A 有两篇文章。NOT IN 若子查询包含 NULL 可能得到意外未知结果；表达“不存在匹配”时，NOT EXISTS 往往更贴近意图，但仍要明确关联条件。

## 5. 分组、过滤与性能边界

WHERE 先限制参与聚合的行，HAVING 限制聚合后的组。例如 HAVING count(p.id)>=2 表达至少两篇；不能把同一聚合直接塞进普通 WHERE。SELECT 中非聚合列需要满足分组语义，不能随便选一列期待数据库“帮忙挑一行”。

查询正确后再读执行计划；索引不能修复错误口径。SQL 写成多个 CTE 可能更清楚，但是否物化、是否内联与版本和查询特征有关，不能一律认为更快或更慢。

## 6. 错误驱动与练习

1. 给 A 添加第二篇已发布文章，验收查询输出 posts=2，而 B 仍是 0。
2. 新增标签集合，先复现重复求和，再用先聚合后关联修复；验收给出连接前后行数。
3. 比较 NOT IN 和 NOT EXISTS 在含 NULL 样本上的结果，验收逐步解释未知值如何进入判断。

## 7. 资料链接

- [PostgreSQL：表表达式与连接](https://www.postgresql.org/docs/18/queries-table-expressions.html)
- [PostgreSQL：聚合函数](https://www.postgresql.org/docs/18/functions-aggregate.html)
