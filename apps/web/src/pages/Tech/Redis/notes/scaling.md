## 1. 可用性和分片扩容不同

复制提供数据副本；Sentinel 监控主从并协调故障转移；Cluster 按哈希槽把键分到多个主节点。它们解决不同问题：加副本不自动分散单个主节点的写入，也不让一个热键平均分布到全部节点。

本节使用 Redis 7+ 通用机制。完整 Cluster/Sentinel 需要多实例、独立配置和故障演练；本节先用两实例复制实验验证核心关系，不把它冒充生产高可用集群。

## 2. 角色与限制

| 机制     | 提供什么                   | 必须另外考虑                         |
| -------- | -------------------------- | ------------------------------------ |
| 主从复制 | 把写入传播到副本           | 通常异步，可能有延迟与故障丢写       |
| Sentinel | 监控、发现、选举和主从切换 | 客户端发现新主、仲裁和网络分区       |
| Cluster  | 16384 个哈希槽分片         | 多键同槽要求、重定向、迁移与集群状态 |
| WAIT     | 等待一定复制确认           | 不自动构成所有故障下的强一致提交     |

**热键**是访问集中在少数键，**大键**是单键内容或成员很多，二者可同时出现。热键可能占满一个节点，大键全量读取、删除或迁移则可能造成延迟与资源尖峰。

## 3. 完整复制实验

先预测：客户端直接写副本会怎样？确认 6394、6395 空闲，在两个终端各启动自己拥有的实例：

```sh
# 终端 A
redis-server --bind 127.0.0.1 --port 6394 --save "" --appendonly no
# 终端 B
redis-server --bind 127.0.0.1 --port 6395 --save "" --appendonly no --replicaof 127.0.0.1 6394
```

在第三个终端：

```sh
# SET 与 WAIT 必须位于同一客户端连接；WAIT 针对本连接此前写入的复制偏移。
redis-cli -p 6394 <<'REDIS'
SET lp:scale:item A
WAIT 1 2000
REDIS
redis-cli -p 6395 GET lp:scale:item
redis-cli -p 6395 SET lp:scale:item B
redis-cli -p 6394 INFO replication
redis-cli -p 6395 INFO replication
```

预期在复制正常时 WAIT 返回至少一个确认副本，副本读取 A；默认只读副本拒绝写入。若 WAIT 超时返回 0，先观察复制连接是否完成，不能盲目断言值已经同步。完成后在 A/B 各 Ctrl+C，不改已有实例复制角色。

## 4. Cluster 的键槽推导

Cluster 把键映射到槽，并把槽分配给主节点。多键事务或脚本通常要求相关键同槽。键名中的 hash tag 可让括号中的子串参与槽计算，例如 `order:{42}:meta` 与 `order:{42}:items` 可聚到同槽。

```text
键 → 槽计算 → 主节点
                 └→ 副本
```

在真正独立 Cluster 上，可用 `CLUSTER KEYSLOT order:{42}:meta` 与 `CLUSTER KEYSLOT order:{42}:items` 核对；单机未启用集群时该命令不能代替真实集群测试。hash tag 过度集中也会制造热点。客户端需要处理 MOVED/ASK 等重定向，不能硬编码一个节点就声称支持整个集群。

## 5. 排查性能和故障边界

先观察命令延迟、慢日志、CPU、网络、内存与键分布，再决定拆大键、读副本、本地缓存或分片。SLOWLOG 更接近服务端执行部分，不能覆盖全部网络与客户端等待。副本读可能陈旧，业务必须允许这种语义。

故障转移选择副本后，旧主上已确认但未传播的写入可能丢失；锁、计数、幂等记录也会受影响。Sentinel 数量与仲裁配置、Cluster 槽覆盖、持久化和客户端重连策略都要纳入演练。

## 6. 练习与验收

1. 暂停实验主实例后观察副本读与写的边界，验收不把人工改角色当作已经验证 Sentinel 自动切换。
2. 设计一个超热排行榜的读写拆分方案，验收说明单键写热点能否被分片真正分散。
3. 为 Cluster 多键脚本列出同槽方案及热点风险，验收能处理重定向和迁移时的失败。

## 7. 资料链接

- [Redis：复制](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- [Redis：Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
- [Redis：Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)
