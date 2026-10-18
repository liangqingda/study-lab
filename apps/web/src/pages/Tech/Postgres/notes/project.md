## 1. 用订单模型证明数据库设计成立

交付一个小型订单模型，说明业务不变量、查询口径、并发更新、索引选择和恢复边界。这里不要求把每个学过的特性塞进去，而是能解释为什么采用某项约束与事务。

实验基于 PostgreSQL 18，只在确认 study_lab 后创建临时表，全部放在事务内回滚。它验证局部模型，不冒充完整生产订单系统。

## 2. 业务定义先于表结构

| 事实   | 不变量                       | 实现意图                  |
| ------ | ---------------------------- | ------------------------- |
| 商品   | 当前价格非负，库存非负       | 类型、CHECK、条件更新     |
| 订单   | 请求标识不能重复创建同一业务 | 唯一业务键                |
| 订单项 | 数量正数，成交单价是快照     | NOT NULL、CHECK、引用关系 |
| 金额   | 按订单项快照计算             | 不依赖商品未来价格        |

退款、优惠、税费、多币种与支付清算不在本最小模型范围；若加入，必须扩展金额口径，不能继续把 sum(qty*price) 当所有场景最终结算额。

## 3. 完整可回滚实验

先预测：修改商品当前价格后，已创建订单金额会不会变化？保存 `order-project.sql`：

```sql
\set ON_ERROR_STOP on
SELECT current_database()='study_lab' AS correct_db \gset
\if :correct_db
\else
  \quit
\endif
BEGIN;
CREATE TEMP TABLE demo_learning_path_product(
 id integer PRIMARY KEY,price numeric(10,2) NOT NULL CHECK(price>=0),stock integer NOT NULL CHECK(stock>=0));
CREATE TEMP TABLE demo_learning_path_order(
 id integer PRIMARY KEY,request_key text NOT NULL UNIQUE);
CREATE TEMP TABLE demo_learning_path_order_item(
 order_id integer REFERENCES demo_learning_path_order(id),
 product_id integer REFERENCES demo_learning_path_product(id),
 qty integer NOT NULL CHECK(qty>0),unit_price numeric(10,2) NOT NULL CHECK(unit_price>=0),
 PRIMARY KEY(order_id,product_id));
INSERT INTO demo_learning_path_product VALUES(1,12.50,3);
INSERT INTO demo_learning_path_order VALUES(100,'request-A');
WITH picked AS (
 UPDATE demo_learning_path_product SET stock=stock-2 WHERE id=1 AND stock>=2 RETURNING id,price
)
INSERT INTO demo_learning_path_order_item
SELECT 100,id,2,price FROM picked;
SELECT sum(qty*unit_price) AS total FROM demo_learning_path_order_item WHERE order_id=100;
UPDATE demo_learning_path_product SET price=99 WHERE id=1;
SELECT sum(qty*unit_price) AS total FROM demo_learning_path_order_item WHERE order_id=100;
SELECT stock FROM demo_learning_path_product WHERE id=1;
ROLLBACK;
```

运行 `psql "$DATABASE_URL" -f order-project.sql`。预期两次 total 都是 25.00，剩余 stock=1；商品价格变动不改变订单项快照。最终回滚，不保留实验对象。

## 4. 从实验走向真实业务时补什么

若库存不足，picked 没有行，订单项不会创建，但前面订单行仍已插入。本实验刻意展示这一边界：真实流程必须检查结果，选择回滚整个事务或明确创建待处理状态，不能把“SQL 没抛错”当成功。

幂等键唯一约束会拒绝重复键，但“重复时返回原结果”还需要保存请求指纹与业务状态。并发重复创建、同键异参、提交后响应丢失都需要测试。数据库事务无法回滚已发邮件或外部支付，跨系统副作用需要独立幂等与可靠投递方案。

## 5. 查询、索引与运维审阅

订单查询应区分订单行和订单项行，避免 join 后重复统计订单数量。根据用户/时间访问模式设计复合索引，使用代表性数据与 EXPLAIN 验证；临时小表跑得快不能证明生产可扩展。

应用角色只获所需权限；迁移和管理角色分开。恢复策略既包括备份，也包括恢复后的业务校验。不要为重跑教学实验清空共享 study_lab 的现有数据。

## 6. 练习与交付标准

1. 修复库存不足但订单行仍存在的问题，验收声明状态机或事务回滚策略，并测试无足够库存。
2. 加入同键同参返回原订单、同键异参拒绝的设计，验收覆盖并发与响应丢失。
3. 提交模型图、三条核心查询、双会话时间线和索引依据，每条结论配样本或执行计划证据。
4. 写迁移和恢复方案，验收明确当前库确认、数据保留、权限、恢复验证与失败处理。

## 7. 资料链接

- [PostgreSQL：约束](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [PostgreSQL：事务隔离](https://www.postgresql.org/docs/18/transaction-iso.html)
- [PostgreSQL：执行计划](https://www.postgresql.org/docs/18/using-explain.html)
