## 1. 模型的职责是排除非法状态

约束把重要业务不变量放到数据库边界，避免“只有某个接口记得检查”。应用校验提供友好反馈，数据库约束则在并发与多入口写入下继续兜底。二者互补，不是二选一。

本节针对 PostgreSQL 18。实验只在确认 study_lab 后创建本会话临时表，并以 ROLLBACK 结束，不改已有业务表。

## 2. 类型与约束的选择

| 机制        | 保证什么         | 不保证什么                                          |
| ----------- | ---------------- | --------------------------------------------------- |
| PRIMARY KEY | 标识唯一且非空   | 不自动代表业务自然键                                |
| UNIQUE      | 按配置限制重复   | 默认允许多个 NULL，需理解 NULLS NOT DISTINCT 等选择 |
| FOREIGN KEY | 引用关系合法     | 不默认自动给引用端建立索引                          |
| NOT NULL    | 列必须有值       | 不禁止空字符串                                      |
| CHECK       | 每行值满足表达式 | 表达式结果为 NULL 时通常不阻止写入                  |

金额可用 numeric 或按最小货币单位存整数，避免 float 的二进制近似误差。timestamptz 表示一个时间点，显示随会话时区改变，并不保存原始时区名字；timestamp without time zone 表达无时区本地日期时间。JSONB 适合某些半结构数据，但不能借它逃避所有关系与约束设计。

## 3. 完整实验：合法订单与非法数量

先预测：只有 CHECK(qty>0) 而没有 NOT NULL 时，NULL 是否一定会被拒绝？保存 `schema.sql`：

```sql
\set ON_ERROR_STOP on
SELECT current_database() = 'study_lab' AS correct_db \gset
\if :correct_db
\else
  \echo '连接必须指向 study_lab'
  \quit
\endif
BEGIN;
CREATE TEMP TABLE demo_learning_path_products (
  id integer PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  price numeric(10,2) NOT NULL CHECK (price >= 0)
);
CREATE TEMP TABLE demo_learning_path_items (
  id integer PRIMARY KEY,
  product_id integer NOT NULL REFERENCES demo_learning_path_products(id),
  qty integer NOT NULL CHECK (qty > 0)
);
INSERT INTO demo_learning_path_products VALUES (1,'BOOK',19.90);
INSERT INTO demo_learning_path_items VALUES (1,1,2);
SELECT qty * price AS total
FROM demo_learning_path_items i JOIN demo_learning_path_products p ON p.id=i.product_id;
SAVEPOINT before_bad;
\set ON_ERROR_STOP off
INSERT INTO demo_learning_path_items VALUES (2,1,0);
\set ON_ERROR_STOP on
ROLLBACK TO SAVEPOINT before_bad;
SELECT count(*) AS item_count FROM demo_learning_path_items;
ROLLBACK;
```

运行 `psql "$DATABASE_URL" -f schema.sql`。预期 total 为 39.80，数量 0 的 INSERT 违反 CHECK，回滚到保存点后 item_count 仍为 1。具体错误文本随版本和本地化变化，不依赖固定文案。显式保存点让教学故障不把整个事务留在失败状态。

## 4. 关系设计怎样推导

订单和商品通常是多对多关系，通过订单项表达数量和成交时价格。成交价格应按业务决定是否作为订单项快照，不能让后来修改商品价格重写历史订单金额。

外键删除行为要明确：RESTRICT/NO ACTION、CASCADE、SET NULL 等各有用途，不能一律级联。索引引用端可以减少检查与关联查询成本，但应结合写入开销及实际查询，而不是凭“外键存在”假定索引已创建。

## 5. 失败案例与边界

先 SELECT 看用户名不存在再 INSERT，会在并发下同时通过；UNIQUE 让最终不变量由数据库保证，应用再解释冲突。CHECK 不能用来可靠表达跨行统计约束；并发库存总量等需要适当锁、事务或模型设计。

允许 NULL 的列必须解释“未知”和“不适用”是否同义。过多宽泛可空列可能掩盖不同实体，过度拆表也可能增加复杂性；按事实和访问需求建模，不按对象继承图机械生成表。

## 6. 练习与验收

1. 在保存点内测试 NULL 数量、重复 SKU、缺失商品，验收指出分别触发哪类约束。
2. 设计成交价快照，验收修改商品当前价格后历史金额不变。
3. 比较默认 UNIQUE 与 NULLS NOT DISTINCT 的重复 NULL 行为，验收写明所用 PostgreSQL 版本。

## 7. 资料链接

- [PostgreSQL 18：约束](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [PostgreSQL：数据类型](https://www.postgresql.org/docs/18/datatype.html)
