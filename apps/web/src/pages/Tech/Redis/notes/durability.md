## 1. 持久化、复制与备份不同

持久化帮助进程重启或故障后从磁盘恢复；复制把变化传给其他实例；备份提供可独立保留与恢复的历史副本。误删除可以被复制，也可以写进 AOF，因此“开了持久化和副本”不等于拥有可恢复历史。

本节以 Redis 7+ 的 RDB 与多段 AOF 机制为基础。不要对前面无持久化的临时实例或已有项目实例直接切生产配置。下面单独启动自己拥有的新实例和目录。

## 2. RDB 与 AOF 的取舍

| 机制        | 写入内容                              | 主要边界                                  |
| ----------- | ------------------------------------- | ----------------------------------------- |
| RDB         | 某时间点的数据快照                    | 快照之后的修改可能丢失                    |
| AOF         | 写操作日志及重写后的基础数据/增量文件 | fsync 策略、磁盘与故障模型决定耐久窗口    |
| AOF rewrite | 重建更紧凑的恢复表示                  | 需要额外磁盘/内存与后台工作，不是清空数据 |
| RPO / RTO   | 可接受丢失窗口 / 恢复时间目标         | 配置必须配合实际恢复演练验证              |

RDB 的后台生成和 AOF 重写涉及 fork、写时复制与磁盘压力；大数据量和高写入会改变代价。appendfsync everysec 通常按秒安排同步，但不能把它承诺成任何故障都严格最多丢一秒。

## 3. 完整实验 A：RDB 恢复

先预测：保存快照后再修改键，重启后恢复哪个值？确认 6392 端口空闲，在终端 A：

```sh
RDB_LAB_DIR="$(mktemp -d /tmp/redis-lesson-rdb.XXXXXX)"
echo "$RDB_LAB_DIR" # 记下这个本次专用路径，重启时使用同一路径
redis-server --bind 127.0.0.1 --port 6392 --dir "$RDB_LAB_DIR" --dbfilename lesson.rdb --save "" --appendonly no
```

终端 B：

```sh
redis-cli -p 6392 SET lp:durable:value before
redis-cli -p 6392 SAVE
redis-cli -p 6392 SET lp:durable:value after
redis-cli -p 6392 SHUTDOWN NOSAVE
```

重新执行终端 A 启动命令，再 GET 该键，预期 before。这是明确 NOSAVE 的正常关闭实验，不是模拟操作系统崩溃，但能说明快照时间点语义。SAVE 同步阻塞，此处仅限小隔离实例，不能据此推荐在线大实例随意 SAVE。

## 4. 完整实验 B：AOF 重启

在另一个全新目录和空闲 6393 端口启动：

```sh
AOF_LAB_DIR="$(mktemp -d /tmp/redis-lesson-aof.XXXXXX)"
echo "$AOF_LAB_DIR" # 重启时沿用该目录，不再生成新目录
redis-server --bind 127.0.0.1 --port 6393 --dir "$AOF_LAB_DIR" --save "" --appendonly yes --appendfsync always
```

另一个终端执行：

```sh
redis-cli -p 6393 SET lp:durable:value logged
redis-cli -p 6393 INFO persistence
redis-cli -p 6393 SHUTDOWN NOSAVE
```

用相同配置重启，GET 预期 logged。NOSAVE 不要求新写 RDB，但不等于丢弃已经持久化的 AOF。Redis 7+ 的 AOF 可能由目录、manifest、基础和增量文件共同组成，不能只复制一个旧式 appendonly.aof 就假定完整备份。

## 5. 解释结果而不夸大保证

上述两个实验分别验证从 RDB 与 AOF 正常恢复，不验证断电、磁盘损坏和 fsync 故障。always 增加同步成本，也不能替代可靠存储和备份。若两种机制同时启用，应理解启动恢复选择及文件完整性，不凭文件更新时间猜恢复路径。

备份要记录版本、配置、所需文件集合与一致性时点，并在获准隔离目标恢复，核对键数量、关键值、TTL 与业务可用性。日志里记录“备份完成”不等于已经达到 RTO。

## 6. 错误与练习

1. 在 RDB 实验比较 before/after 两个时点，验收能明确说出丢失的是哪段修改。
2. 比较 always 与 everysec 的延迟与恢复风险，验收不把正常重启结果当断电保证。
3. 写出包含 AOF 多文件与配置的恢复清单，验收目标目录隔离，绝不覆盖现有实例文件。

结束时只关闭自己启动的 6392、6393 实例，不运行全局 kill，不删除不属于本次实验的目录。

## 7. 资料链接

- [Redis：持久化](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis：备份建议](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#backing-up-redis-data)
