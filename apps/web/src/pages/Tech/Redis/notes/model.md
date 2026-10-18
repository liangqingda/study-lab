## 1. Redis 的基本单位是有类型的键

Redis 通过键访问字符串、哈希、集合等不同数据结构，命令在服务端操作这些结构。它常用作缓存，也可以承担计数、协调或消息等角色，但这些角色对数据丢失、一致性和恢复的要求不同。

本模块使用 Redis 开源版的通用命令；示例以 Redis 7+ 可用的能力为基线，不假定新版本或商业版专属功能。所有写入实验只在**自己启动的隔离实例**运行，不能连接项目或用户现有实例后清空数据。

## 2. 建立隔离实验环境

需要已安装 redis-server 和 redis-cli。确认 6391 端口空闲，再在一个终端运行：

```sh
redis-server --bind 127.0.0.1 --port 6391 --save "" --appendonly no
```

该实例只监听本机，关闭 RDB 自动快照和 AOF；它不是耐久存储。各节预期结果按本节键前缀初始为空推导；复跑时换一个新前缀，或重启自己这个无持久化实例，不清理共享库。后续终端统一用 `redis-cli -p 6391`，结束时回到自己启动的服务器按 Ctrl+C，不停止其他实例，不使用 FLUSHALL/FLUSHDB。

## 3. 键、值、类型和生命周期

| 概念       | 含义                         | 观察命令         |
| ---------- | ---------------------------- | ---------------- |
| key        | 命名数据的入口，建议业务前缀 | EXISTS、SCAN     |
| type       | 值支持的操作集合             | TYPE             |
| TTL        | 键剩余有效时间               | TTL、PTTL        |
| expiration | 到期后的删除语义             | EXPIRE、SET EX   |
| eviction   | 内存受限时按策略淘汰         | 与过期是不同机制 |

TTL 返回 -2 表示键不存在，-1 表示存在但没有过期时间。键名中的冒号只是命名约定，不自动形成数据库目录或权限隔离。Redis Cluster 通常使用数据库 0，不能用 SELECT 数据库编号当通用分片方法。

## 4. 完整实验：覆盖写会怎样影响过期

先预测：一个有 TTL 的键被普通 SET 覆盖后，是否仍有原 TTL？

```sh
redis-cli -p 6391 SET lp:model:token hello EX 60
redis-cli -p 6391 TYPE lp:model:token
redis-cli -p 6391 TTL lp:model:token
redis-cli -p 6391 SET lp:model:token world
redis-cli -p 6391 TTL lp:model:token
redis-cli -p 6391 SET lp:model:token again EX 60
redis-cli -p 6391 SET lp:model:token retained KEEPTTL
redis-cli -p 6391 TTL lp:model:token
```

| 阶段          | 预期                               | 原因                     |
| ------------- | ---------------------------------- | ------------------------ |
| 首次 SET EX   | OK，类型 string，TTL 在 0～60 附近 | 计时与命令间隔会消耗时间 |
| 普通 SET 覆盖 | TTL=-1                             | 默认覆盖值会清除已有过期 |
| KEEPTTL 覆盖  | 仍有正 TTL                         | 显式保留已有过期信息     |

不能精确断言 TTL 必为 60；运行速度和调度影响数值。若先设置值再独立 EXPIRE，中间失败可能留下永不过期键；SET 带 EX/PX 能把设置和有效期放在同一命令。

## 5. 边界与错误排查

把 string 键拿去 HSET 会报类型错误，不是 Redis 自动转换结构。先 TYPE 再核对键名约定，必要时换新键做迁移，而不是删除未知共享键。

过期删除可能通过访问时检查和后台工作发生，不要据此要求服务器在某毫秒对所有到期键立即完成物理回收。内存淘汰则由 maxmemory 和策略约束，数据可能在 TTL 到期前消失。持久化也不等于客户端每次收到 OK 后任何机器故障都零丢失。

## 6. 练习与验收

1. 对比 SET EX、SET KEEPTTL、PERSIST，验收分别记录不存在、永不过期和有 TTL 三种状态。
2. 设计验证码与用户会话键名，验收明确命名空间、数据类型、过期和敏感信息边界。
3. 使用 SCAN 在隔离实例遍历本节前缀，验收知道 SCAN 是增量迭代且可能重复，不用 KEYS 扫生产全库。

## 7. 资料链接

- [Redis：SET](https://redis.io/docs/latest/commands/set/)
- [Redis：EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis：数据类型](https://redis.io/docs/latest/develop/data-types/)
