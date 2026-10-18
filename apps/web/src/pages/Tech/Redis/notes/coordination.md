## 1. 协调能力的难点在失败之后

限流控制访问速率，锁协调互斥，消息机制解耦生产与处理。它们都涉及时间、重试和进程失败，不能只验证正常路径。实验使用 Redis 7+、自己启动的 6391 隔离实例。

## 2. 限流：窗口算法的选择

固定窗口给一段时间计数，窗口交界可能允许短时双倍突发；滑动窗口更平滑但需要更多状态；令牌桶允许受控突发并限制长期速率。不要把算法名称直接当作“绝不超限”的证明，时间来源、原子性和分布式调用都影响实现。

先预测：第一窗口最多允许 3 次，第 4 次返回什么？保存 `limit.lua`：

```lua
local maximum = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
if not maximum or maximum < 1 or not window or window < 1 then
  return redis.error_reply('invalid limit')
end
local count = redis.call('INCR',KEYS[1])
if count == 1 then redis.call('PEXPIRE',KEYS[1],window) end
return {count <= maximum and 1 or 0,count,redis.call('PTTL',KEYS[1])}
```

```sh
redis-cli -p 6391 --eval limit.lua lp:coord:limit , 3 60000
# 在 60 秒内重复四次，预期允许标识依次 1、1、1、0
```

这是从首次请求开始计时的固定 TTL 窗口，不是与整分钟对齐的窗口。每次调用即使拒绝仍计数；若业务要另一口径，应显式改算法。脚本把首次计数和设置过期合并，避免两命令间失败留下永久计数。

## 3. 锁：唯一令牌与原子释放

```sh
redis-cli -p 6391 SET lp:coord:lock owner-A NX PX 30000
redis-cli -p 6391 SET lp:coord:lock owner-B NX PX 30000
```

第一条通常 OK，第二条在锁未过期时不成功。owner-A 在真实系统必须是足够唯一的持有者令牌，不用固定名字。释放不能直接 DEL，也不能先 GET 再 DEL：检查和删除之间锁可能过期并被别人获得。

```lua
-- 保存为 unlock.lua
if redis.call('GET',KEYS[1]) == ARGV[1] then
  return redis.call('DEL',KEYS[1])
end
return 0
```

执行 `redis-cli -p 6391 --eval unlock.lua lp:coord:lock , owner-A`。只有仍匹配的持有者删除成功。租约到期并不让暂停中的旧进程停止工作；需要防止旧持有者写入时，可让目标资源校验单调 fencing token。token 的发放、故障转移与资源校验必须构成完整方案，不能只多加一个 Redis 计数就宣称安全。

## 4. Pub/Sub 与 Streams 各自怎么用

Pub/Sub 是在线发布订阅：终端 A 运行 `redis-cli -p 6391 SUBSCRIBE lp:coord:news`，终端 B 执行 `redis-cli -p 6391 PUBLISH lp:coord:news hello`。A 在线能收到，断开后发布的消息不会因重新订阅自动重放。

Streams 记录消息并支持消费组。以下在隔离实例逐条执行，星号必须加引号以免被 shell 展开：

```sh
redis-cli -p 6391 XADD lp:coord:jobs '*' task send-report
redis-cli -p 6391 XGROUP CREATE lp:coord:jobs workers 0
redis-cli -p 6391 XREADGROUP GROUP workers c1 COUNT 1 STREAMS lp:coord:jobs '>'
redis-cli -p 6391 XPENDING lp:coord:jobs workers
# 从 XREADGROUP 结果复制真实消息 id
redis-cli -p 6391 XACK lp:coord:jobs workers '<消息id>'
```

预期新消息被 c1 获取，确认前在 pending 中，XACK 后不再 pending；XACK 不删除原消息。消费失败需要检查并转移长期未确认项，例如使用 XAUTOCLAIM，并正确处理重投。

## 5. 一张失败时间线

| 时间 | 消费者             | 业务系统     | Redis          |
| ---- | ------------------ | ------------ | -------------- |
| t1   | 读取消息           | —            | 进入 pending   |
| t2   | 完成写入           | 业务已成功   | 尚未 XACK      |
| t3   | 消费者崩溃         | 成功仍存在   | 等待重投       |
| t4   | 其他消费者重新处理 | 可能重复执行 | 仍需要业务幂等 |

所以消费组不等于业务“恰好一次”。确认时点、重试、死信与幂等记录都属于业务设计。

## 6. 练习与验收

1. 并发调用限流脚本，验收窗口和允许数量口径明确，并分析交界突发。
2. 模拟锁过期后旧持有者继续写，验收指出比较令牌释放解决了什么、没有解决什么。
3. 重投一条已产生业务效果但未确认的消息，验收业务只执行一次，不能靠“不重投”逃避失败处理。

## 7. 资料链接

- [Redis：分布式锁](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [Redis：Streams](https://redis.io/docs/latest/develop/data-types/streams/)
- [Redis：Pub/Sub](https://redis.io/docs/latest/develop/pubsub/)
