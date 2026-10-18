## 1. 可运行还不等于可恢复

数据库运维要回答结构如何安全演进、权限如何限制、空间和统计如何维护、故障后能恢复到哪里。**RPO**描述可接受的数据丢失窗口，**RTO**描述恢复服务的目标时间；备份文件存在不等于恢复演练通过。

基线 PostgreSQL 18。以下只读观察可直接在 study_lab 执行；迁移与恢复是明确标注的方案，不对现有表自动实施，也不创建其他项目数据库。

## 2. 迁移要跨越新旧应用共存期

增加一个必填字段时，直接对大表执行复杂默认值和强约束可能带来锁、扫描或版本相关成本。常见 expand/contract 流程是先兼容性扩展，再回填，再验证，再切换读写，最后移除旧路径。

| 阶段 | 操作意图                   | 核对点                         |
| ---- | -------------------------- | ------------------------------ |
| 扩展 | 新字段先允许旧应用继续工作 | 锁级别、默认值语义、版本支持   |
| 回填 | 分批补齐历史数据           | 每批时长、重试、是否覆盖新写入 |
| 验证 | 证明新约束可满足           | 失败行如何修正                 |
| 切换 | 新旧应用按计划发布         | 回滚应用是否仍兼容             |
| 收缩 | 删除旧结构或旧逻辑         | 确认没有依赖者                 |

“DDL 可以回滚”不代表运行 DDL 时没有锁影响，回滚后的外部系统也不会自动倒退。

## 3. 完整只读观察实验

先预测：n_dead_tup 是精确实时计数吗？保存 `operations.sql` 并通过 psql 执行：

```sql
SELECT current_database(),current_user;
SHOW server_version;
SHOW search_path;
SELECT relname,n_live_tup,n_dead_tup,last_autovacuum,last_autoanalyze
FROM pg_stat_user_tables
ORDER BY relname;
SELECT pid,state,wait_event_type,wait_event
FROM pg_stat_activity
WHERE datname=current_database()
ORDER BY pid;
```

预期返回当前数据库和可见统计。统计值可能是估计或受采样/权限影响，空值不必然表示功能坏了；普通用户也未必能看到其他会话的全部信息。不在共享环境打印其他用户的敏感查询文本。

## 4. VACUUM、ANALYZE 与 WAL

MVCC 更新删除后留下旧版本，VACUUM 让不再需要的版本空间可复用并维护相关元信息；普通 VACUUM 通常不等于把整个表文件压缩归还操作系统。VACUUM FULL 会重写并有不同锁与空间成本，不应作为日常随手清理命令。

ANALYZE 收集优化器统计。WAL（预写日志）把修改的恢复记录在相关数据页持久化前按规则写入，用于崩溃恢复和相关复制/归档场景；WAL 本身不是一个无期限完整备份。

## 5. 备份策略与恢复流程

逻辑备份导出对象和数据，适合选择性迁移；物理基础备份配合连续 WAL 归档可支持时间点恢复。主从复制提高可用性，但误删除可能迅速复制到副本，所以副本不替代备份。

```text
备份完成 → 校验文件与版本 → 在获准的隔离恢复环境演练
→ 校验约束与关键查询 → 记录恢复耗时和丢失窗口 → 决定是否符合 RPO/RTO
```

命令参考：`pg_dump --format=custom "$DATABASE_URL" --file=study_lab_backup.dump` 是读取导出，但可能产生负载和敏感文件；恢复命令 `pg_restore --dbname=<获准的隔离目标> ...` 会修改目标，必须先单独确认目标与权限。本笔记不提供一个可误指生产库的默认恢复命令。

### 5.1 一个可复现的隔离逻辑备份演练

下面需要 Docker 和 PostgreSQL 18 镜像；**本任务未执行此容器实验**。容器内数据库仍叫 study_lab，不暴露主机端口且禁用外部网络，不连接本机项目库。确认容器名未被使用，所有操作只针对本次新建容器：

```sh
docker run -d --rm --name pg-notes-restore --network none -e POSTGRES_DB=study_lab -e POSTGRES_HOST_AUTH_METHOD=trust postgres:18
# 等 pg_isready 确认就绪；若未就绪，先查本次容器日志，不继续写入。
docker exec pg-notes-restore pg_isready -U postgres -d study_lab
docker exec pg-notes-restore psql -U postgres -d study_lab -v ON_ERROR_STOP=1 -c "SELECT current_database(); CREATE TABLE demo_learning_path_backup(id integer PRIMARY KEY); INSERT INTO demo_learning_path_backup VALUES(7);"
BACKUP_FILE="$(mktemp /tmp/learning-path-backup.XXXXXX)"
docker exec pg-notes-restore pg_dump -U postgres -d study_lab -Fc -t demo_learning_path_backup > "$BACKUP_FILE"
# 只删除本次隔离容器中自己创建的实验表，用于验证恢复；不是共享库清理命令。
docker exec pg-notes-restore psql -U postgres -d study_lab -v ON_ERROR_STOP=1 -c 'DROP TABLE demo_learning_path_backup'
docker exec -i pg-notes-restore pg_restore -U postgres -d study_lab --exit-on-error < "$BACKUP_FILE"
docker exec pg-notes-restore psql -U postgres -d study_lab -c 'TABLE demo_learning_path_backup'
docker stop pg-notes-restore
```

预期恢复后得到一行 id=7。此实验是单表逻辑备份，不包含完整角色、扩展和 WAL 时间点恢复；成功不证明全量生产恢复达标。失败时停止后续写入，保留命令结果，仅关闭本次容器。

### 5.2 权限的实际边界

应用连接不应使用超级用户。管理员可按对象授予 schema 的 USAGE、表的 SELECT/INSERT/UPDATE，以及序列的适用权限；schema 的 USAGE 不是表 SELECT，默认权限也只按其适用对象所有者和后续对象规则生效。审阅时用 `has_table_privilege(current_user,'schema.table','SELECT')` 检查具体对象；其中 schema.table 必须替换为获准检查的真实对象，不能把角色能连接数据库等同于能读全部表。

## 6. 常见错误与练习

1. 制定新增非空列方案，验收包含锁影响、分批回填、验证和旧应用回滚路径。
2. 区分 VACUUM、ANALYZE、备份与复制的职责，验收每个机制都列出“不能解决的故障”。
3. 写恢复演练清单，验收包括凭据、扩展版本、权限、约束、关键查询和恢复耗时，不只检查文件存在。

## 7. 资料链接

- [PostgreSQL：备份与恢复](https://www.postgresql.org/docs/18/backup.html)
- [PostgreSQL：日常清理](https://www.postgresql.org/docs/18/routine-vacuuming.html)
- [PostgreSQL：WAL](https://www.postgresql.org/docs/18/wal.html)
