## 1. 从数据关系开始，而不是先背 SQL

关系模型用表表达一类记录及其关系。行代表一条事实，列有明确类型和含义。表不是有序数组：没有 ORDER BY 的查询结果不保证稳定顺序，今天恰好按 id 排列不能当作接口契约。

本模块以 **PostgreSQL 18 与 psql** 为基线。仓库真实数据库只允许 DATABASE_URL 指向 study_lab；本节实验只读，不创建或清空已有表。查询中用 VALUES 构造样本，断开连接后不遗留对象。

## 2. 对象层级和查询术语

| 术语           | 含义                       | 示例                                |
| -------------- | -------------------------- | ----------------------------------- |
| 数据库         | 一次连接选定的数据集合边界 | current_database() 返回当前库       |
| schema         | 数据库中的命名空间         | public.articles 中 public 是 schema |
| 表/列/行       | 关系、属性、记录           | 作者表中的 name 列                  |
| 连接/会话      | 客户端与服务器交互的上下文 | 事务和临时对象通常属于会话          |
| 投影/过滤/排序 | 选哪些列、哪些行、按何顺序 | SELECT、WHERE、ORDER BY             |

同名表可以在不同 schema；search_path 决定未限定名称的解析，生产代码不要依赖不受控的搜索路径。权限是对象访问规则，不是看到连接成功就可以操作全部表。

## 3. 完整只读实验

先预测：LIMIT 2 是筛选前两行还是排序后两行？保存为 `relational.sql`：

```sql
SELECT current_database(), current_user;
WITH articles(id, title, views) AS (
  VALUES (1, 'CSS', 30), (2, 'HTTP', 10), (3, 'SQL', 30), (4, 'Redis', 5)
)
SELECT id, title, views
FROM articles
WHERE views >= 10
ORDER BY views DESC, id ASC
LIMIT 2;
```

运行：

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f relational.sql
```

预期返回 `(1,CSS,30)` 与 `(3,SQL,30)`。WHERE 去掉 Redis，ORDER BY 按 views 降序并用 id 打破并列，LIMIT 最后取两条。若只按 views 排序，并列之间的顺序不应被假定。

WITH 为查询结果命名，这里只是提供内联样本；它不是创建永久表。SELECT 的书写顺序与逻辑理解顺序不同，优化器也可能改写物理执行，但必须保持查询语义。

## 4. NULL 与类型的第一条边界

NULL 表示缺失或未知，不等于空字符串、0 或 false。`NULL = NULL` 不产生普通 true，应使用 IS NULL 等语义明确的判断。WHERE 只保留条件为 true 的行，因此未知也被过滤。

```sql
SELECT 1 AS id WHERE NULL = NULL;      -- 零行
SELECT 1 AS id WHERE NULL IS NULL;     -- 一行 1
SELECT '10'::integer + 2 AS result;    -- 12
```

类型转换必须有业务意义；用户输入 '10abc' 转整数会失败，不能通过强制转换把输入校验责任推给数据库报错。数值排序与文本排序也不同，字符串 '10' 和 '2' 的顺序不能按数字直觉理解。

## 5. 常见错误与应用方式

使用 SELECT * 会让返回结构随表变化，并可能泄露新增敏感列。明确列名形成稳定边界。分页只用 OFFSET 且没有稳定排序会出现重复或遗漏；并发数据变化也会影响页间结果，需要按需求选择游标/键集分页与一致性策略。

误把 schema 当独立数据库，会在连接与权限排查时找错对象；先查 current_database、current_user、search_path，再判断表是否存在。客户端界面选中一个对象不等于后续每条 SQL 自动切换到那个库。

## 6. 练习与验收

1. 为样本加入相同 views 的第五行，验收排序与 LIMIT 结果仍可预测。
2. 加入 views 为 NULL 的记录，分别测试 WHERE、IS NULL 与 ORDER BY 的 NULLS FIRST/LAST。
3. 用系统只读查询列出当前连接、schema 与可见表，验收能区分“对象不存在”和“无权限”。

## 7. 资料链接

- [PostgreSQL 18：教程](https://www.postgresql.org/docs/18/tutorial.html)
- [PostgreSQL：SELECT](https://www.postgresql.org/docs/18/sql-select.html)
- [PostgreSQL：schema](https://www.postgresql.org/docs/18/ddl-schemas.html)
