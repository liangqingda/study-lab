## 1. 原子性与并发可见性是两个维度

事务把一组操作作为提交或回滚的单位；**MVCC**用行版本和快照支持并发可见性。它不意味着没有锁，也不意味着一组分开的 SELECT/UPDATE 天然正确。**隔离级别**约束一个事务允许观察到哪些并发现象。

本节以 PostgreSQL 18 为基线。READ COMMITTED 是默认级别，通常每条语句取得新快照；REPEATABLE READ 使用更稳定的事务快照但仍可能有写偏差；SERIALIZABLE 会检测某些无法串行化的依赖，应用需要正确重试整个事务。

## 2. 从扣库存理解原子更新

错误流程是先 SELECT stock=1，再在应用中算成 0，最后 UPDATE stock=0。两个请求都读到 1，都可能返回成功。更直接的条件更新是 `UPDATE ... SET stock=stock-1 WHERE stock>0 RETURNING stock`，让检查与修改由同一语句完成，并检查是否返回行。

| 术语       | 定义                         | 作用                             |
| ---------- | ---------------------------- | -------------------------------- |
| 行锁       | 冲突写入对同一行进行协调     | 后来的更新可能等待               |
| 快照       | 当前语句/事务可见的数据视图  | 不等于磁盘全部最新内容           |
| 死锁       | 多个事务循环等待彼此资源     | 数据库会中止其中事务，应用需处理 |
| 序列化失败 | 无法保证当前并发历史可串行化 | 要重试整体，不只最后一句         |

## 3. 可运行的单会话实验

先预测：只有一件库存时，连续两次条件扣减各返回几行？保存 `transactions.sql`：

```sql
\set ON_ERROR_STOP on
SELECT current_database()='study_lab' AS correct_db \gset
\if :correct_db
\else
  \quit
\endif
BEGIN;
CREATE TEMP TABLE demo_learning_path_stock(id integer PRIMARY KEY, stock integer NOT NULL CHECK(stock>=0));
INSERT INTO demo_learning_path_stock VALUES(1,1);
UPDATE demo_learning_path_stock SET stock=stock-1 WHERE id=1 AND stock>0 RETURNING stock;
UPDATE demo_learning_path_stock SET stock=stock-1 WHERE id=1 AND stock>0 RETURNING stock;
SELECT stock FROM demo_learning_path_stock WHERE id=1;
ROLLBACK;
```

运行 `psql "$DATABASE_URL" -f transactions.sql`，预期第一条更新返回 0 库存，第二条零行，最后 stock=0；ROLLBACK 撤销本节创建的临时对象和写入。这是单会话条件更新实验，不把它冒充真实并发测试。

## 4. 双会话时间线：检查与修改为什么要合并

下面假设两个独立会话看到同一张实验表，初始 stock=1。表中的时间线是推导，实际复现需使用下述专用表，不能用各自不可共享的临时表。

| 时间 | 会话 A                          | 会话 B                     | 结果              |
| ---- | ------------------------------- | -------------------------- | ----------------- |
| t1   | BEGIN；条件 UPDATE 扣减，未提交 | —                          | A 持有相关写锁    |
| t2   | —                               | BEGIN；同一条件 UPDATE     | B 等待 A          |
| t3   | COMMIT                          | 等待解除，重新检查相关条件 | 当前 stock 已为 0 |
| t4   | —                               | UPDATE 返回零行；COMMIT    | B 应报告库存不足  |

如确需复现，在**显式启用的 study_lab 实验连接**先执行 current_database() 确认，再创建新专用表 `demo_learning_path_tx_stock`：

```sql
CREATE TABLE demo_learning_path_tx_stock(id integer PRIMARY KEY,stock integer NOT NULL CHECK(stock>=0));
INSERT INTO demo_learning_path_tx_stock VALUES(1,1);
```

不使用 IF NOT EXISTS：若已存在就停止，不能接管或清空旧表。A、B 各连接 study_lab 并依次执行时间线，UPDATE 语句为 `UPDATE demo_learning_path_tx_stock SET stock=stock-1 WHERE id=1 AND stock>0 RETURNING stock;`。实验后先结束两个事务，只有确认该表由本次自己创建且无其他依赖时，才可手动删除这张实验表。正文推导不代表本任务已连接真实数据库执行。

## 5. 不同隔离级别和锁策略

SELECT FOR UPDATE 适合需要读出后进行多个相关判断的流程，但锁范围和持有时间要小。固定加锁顺序可减少死锁，不代表完全没有死锁。长事务既可能持锁，也可能让旧版本迟迟不能回收。

SERIALIZABLE 不是自动重试器。捕获序列化失败或死锁后，回滚整个事务并按预算退避重试；外部邮件、扣款等副作用必须放在适当边界并幂等，否则重试会重复执行。

## 6. 错误驱动与练习

1. 写出两个“先读再写绝对值”的交错，验收证明为什么两个请求都可能以为自己扣减成功。
2. 用临时表测试保存点与回滚，验收中间错误后事务能恢复到明确位置。
3. 设计双账户转账的锁顺序和总余额不变量，验收覆盖中途失败、死锁重试和重复业务请求。

## 7. 资料链接

- [PostgreSQL 18：事务隔离](https://www.postgresql.org/docs/18/transaction-iso.html)
- [PostgreSQL：显式锁](https://www.postgresql.org/docs/18/explicit-locking.html)
- [PostgreSQL：MVCC](https://www.postgresql.org/docs/18/mvcc.html)
