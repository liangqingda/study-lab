## 1. 保留原行还是折叠原行

GROUP BY 把多行折叠成一组结果；**窗口函数**在保留每行的同时计算其所属窗口上的排名、累计值等。**CTE**给子查询命名，帮助表达步骤；**集合操作**组合多个同结构结果，UNION 去重，UNION ALL 保留重复。

实验基于 PostgreSQL 18，只读 VALUES 样本。前置是 JOIN、聚合与稳定排序。

## 2. 排名与窗口范围

| 函数/结构    | 含义                       | 并列时                           |
| ------------ | -------------------------- | -------------------------------- |
| row_number   | 为每行分配序号             | 需要明确排序打破并列才稳定       |
| rank         | 按组内排序排名             | 并列后跳号，如 1、1、3           |
| dense_rank   | 并列排名不跳号             | 1、1、2                          |
| PARTITION BY | 把计算划到不同组           | 不折叠原行                       |
| frame        | 当前行计算时实际覆盖的范围 | 默认范围可能包含同排序值的同伴行 |

窗口内 ORDER BY 影响计算，不保证最终输出顺序；结果需要外层 ORDER BY。使用累计值时明确 ROWS/RANGE 范围，避免默认行为与业务预期不符。

## 3. 完整实验：并列排名与累计销售

先预测：销量两个 10 的记录会有相同 dense_rank 吗？累计值为什么需要第二排序键？

```sql
WITH sales(id,category,amount) AS (
  VALUES (1,'book',10),(2,'book',10),(3,'book',5),(4,'tool',8)
), ranked AS (
  SELECT *,
    row_number() OVER (PARTITION BY category ORDER BY amount DESC,id) AS rn,
    rank() OVER (PARTITION BY category ORDER BY amount DESC) AS r,
    dense_rank() OVER (PARTITION BY category ORDER BY amount DESC) AS dr,
    sum(amount) OVER (PARTITION BY category ORDER BY amount DESC,id
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running
  FROM sales
)
SELECT id,category,amount,rn,r,dr,running FROM ranked ORDER BY category,rn;
```

保存 `window.sql`，运行 `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f window.sql`。

| book 的 id | rn  | r   | dr  | running |
| ---------- | --- | --- | --- | ------- |
| 1          | 1   | 1   | 1   | 10      |
| 2          | 2   | 1   | 1   | 20      |
| 3          | 3   | 3   | 2   | 25      |

工具类单独计算，累计 8。排名只按 amount 比较，故销量 10 并列；序号和逐行累计加入 id，形成可预测顺序。要选每组前两个排名层次，用 dr<=2；若只要两行，用 rn<=2，语义不同。

## 4. CTE 与递归

普通 CTE 是有名字的查询块，不必然建立物理临时表。递归 CTE 由非递归起点与递归项组成，逐轮推进：

```sql
WITH RECURSIVE n(x) AS (
  VALUES (1)
  UNION ALL
  SELECT x+1 FROM n WHERE x<4
)
SELECT x FROM n ORDER BY x;
```

结果为 1、2、3、4。真实树或图需要终止条件、环检测及深度控制；不是把 UNION ALL 换成 UNION 就能消除所有环。路径中带不断变化的深度字段时，整行并不重复。

## 5. 集合与错误边界

`SELECT 1 UNION SELECT 1` 返回一行；UNION ALL 返回两行。去重有成本，但应先按业务判断是否允许重复。列数需要一致，类型必须能兼容，别用随意强制转文本掩盖错误数据模型。

常见错误是对 LAST_VALUE 使用默认窗口范围，误以为总是得到组最后一行；应显式说明窗口 frame 是否覆盖整个分区。窗口结果通常需要外层查询再筛选，不能在同层 WHERE 中直接把窗口函数当普通列使用。

## 6. 练习与验收

1. 实现每类前两行和前两个排名层次，验收包含并列样本且解释差异。
2. 对比默认 RANGE 累计与显式 ROWS 累计，验收两个相同金额同伴行的结果有逐行推导。
3. 为含环的层级数据设计终止与检测策略，验收不会无上限扩展，且能报告环路径。

## 7. 资料链接

- [PostgreSQL：窗口函数教程](https://www.postgresql.org/docs/18/tutorial-window.html)
- [PostgreSQL：窗口函数](https://www.postgresql.org/docs/18/functions-window.html)
- [PostgreSQL：WITH 查询](https://www.postgresql.org/docs/18/queries-with.html)
