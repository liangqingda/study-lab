## 1. 减少网络往返和保证原子性不是一回事

Pipeline 把多个命令一起发送，降低往返开销；它不阻止其他客户端的命令交错。MULTI/EXEC 把一组命令排队并连续执行，但不会提供关系数据库式的任意运行时回滚。Lua 脚本可以把判断和修改作为一次原子执行，不过长脚本也会阻塞服务器。

实验以 Redis 7+、上一节隔离的 6391 实例为基线。不要在有其他业务流量的实例运行阻塞性实验。

## 2. 三种机制比较

| 机制       | 主要作用                        | 不提供的保证                             |
| ---------- | ------------------------------- | ---------------------------------------- |
| Pipeline   | 减少请求往返                    | 事务隔离、自动回滚                       |
| MULTI/EXEC | 命令排队后连续执行              | 基于前一个返回值在客户端中途决定下一命令 |
| WATCH      | 乐观监控指定键，变化则放弃 EXEC | 自动重试与业务补偿                       |
| Lua        | 服务端把检查与修改合在一起      | 无限执行时间或跨系统事务                 |

## 3. 完整实验：事务中的运行时错误

先预测：INCR 错误是否会撤回同一 EXEC 内后面的 SET？在交互式 `redis-cli -p 6391` 中逐行执行：

```text
SET lp:atomic:value abc
MULTI
INCR lp:atomic:value
SET lp:atomic:after yes
EXEC
GET lp:atomic:after
```

预期 INCR 的结果位置出现整数格式错误，但 SET 仍执行，最后 GET 为 yes。命令排队阶段的语法错误与 EXEC 执行阶段错误不同，不能用这个例子推断所有失败都“继续执行”。生产应用应预先约束类型，逐项检查 EXEC 结果。

Pipeline 可用客户端库的 pipeline 能力，或通过 CLI 管道批量发送，但返回多条响应不构成原子保证。只看总耗时减少不能证明并发正确。

## 4. WATCH 的双会话过程

| 时间 | 会话 A                     | 会话 B               | 结果                           |
| ---- | -------------------------- | -------------------- | ------------------------------ |
| t1   | WATCH lp:atomic:stock；GET | —                    | A 记住被监控键                 |
| t2   | —                          | DECR lp:atomic:stock | 值变化                         |
| t3   | MULTI；SET 新值；EXEC      | —                    | A 的 EXEC 放弃，不应用排队写入 |

在 A/B 两个 CLI 中复现，先在隔离实例 SET stock 1。客户端收到放弃后应重新读取并按有限预算重试，不能盲目重复旧计算。连接必须保持在同一个会话，切换连接会破坏预期 WATCH 上下文。

## 5. 完整原子扣减脚本

先预测库存 1 连续购买两次的结果。保存 `take.lua`：

```lua
local quantity = tonumber(ARGV[1])
if not quantity or quantity <= 0 or quantity % 1 ~= 0 then
  return redis.error_reply('invalid quantity')
end
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current < quantity then return -1 end
return redis.call('DECRBY', KEYS[1], quantity)
```

```sh
redis-cli -p 6391 SET lp:atomic:stock 1
redis-cli -p 6391 --eval take.lua lp:atomic:stock , 1
redis-cli -p 6391 --eval take.lua lp:atomic:stock , 1
```

预期 0、-1，第二次没有把库存扣成负数。脚本内检查和修改不会被其他客户端命令插入；但脚本失败也不是任意已执行写入自动回滚，因此把校验尽量放在写入前。脚本只处理当前 Redis 键，不保证数据库或支付系统同步成功。

## 6. 边界与练习

1. 将 WATCH 实验中的两次读写按不同顺序交错，验收指出哪次 EXEC 会放弃及重试应重新读取什么。
2. 给 Lua 加入非法数量和不存在键用例，验收失败不产生错误负库存。
3. 比较 Pipeline、事务与脚本三种方案，验收分别说明往返次数、并发窗口、错误处理与执行时间上限。

## 7. 资料链接

- [Redis：事务](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [Redis：Pipeline](https://redis.io/docs/latest/develop/using-commands/pipelining/)
- [Redis：脚本](https://redis.io/docs/latest/develop/programmability/eval-intro/)
