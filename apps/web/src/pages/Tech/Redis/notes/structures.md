## 1. 先问操作模式，再选数据结构

把所有数据序列化成一个 JSON 字符串虽然容易，但局部更新、并发修改、成员查询和排行榜操作会变复杂。Redis 数据类型把一些操作放到服务端完成，同时带来命令复杂度、内存布局和数据量边界。

沿用上一节自己启动的 6391 隔离实例；下面仅操作 lp:types 前缀。结果以 Redis 7+ 通用语义为基线，浮点分数的格式显示可能不同。

## 2. 每类结构的可执行用法

先预测：重复加入集合成员、更新同一排行榜成员，数量是否增加？

```sh
redis-cli -p 6391 SET lp:types:counter 0
redis-cli -p 6391 INCR lp:types:counter
redis-cli -p 6391 HSET lp:types:user name Ada level 1
redis-cli -p 6391 HINCRBY lp:types:user level 1
redis-cli -p 6391 HGETALL lp:types:user
redis-cli -p 6391 RPUSH lp:types:queue A B
redis-cli -p 6391 LPOP lp:types:queue
redis-cli -p 6391 SADD lp:types:tags css http css
redis-cli -p 6391 SCARD lp:types:tags
redis-cli -p 6391 ZADD lp:types:rank 10 Ada 20 Bob
redis-cli -p 6391 ZADD lp:types:rank 30 Ada
redis-cli -p 6391 ZRANGE lp:types:rank 0 -1 REV WITHSCORES
```

| 类型       | 典型访问         | 上例结果与原因                          |
| ---------- | ---------------- | --------------------------------------- |
| String     | 简单值与计数     | INCR 返回 1，操作整体整数值             |
| Hash       | 按字段读写对象   | level=2，name=Ada，不需重写整个对象     |
| List       | 两端序列操作     | LPOP 返回 A，剩 B；不是天然可靠消息确认 |
| Set        | 唯一成员与交并差 | 基数 2，重复 css 不产生新成员           |
| Sorted Set | 成员加分数排序   | Ada=30 在 Bob=20 之前，同成员更新分数   |

集合成员遍历顺序不保证固定。Sorted Set 同分时还有成员字典序等排序规则，不能按插入先后猜名次。

## 3. Bitmap、HyperLogLog 和地理位置

```sh
redis-cli -p 6391 SETBIT lp:types:active 3 1
redis-cli -p 6391 SETBIT lp:types:active 9 1
redis-cli -p 6391 BITCOUNT lp:types:active
redis-cli -p 6391 PFADD lp:types:uv user1 user2 user1
redis-cli -p 6391 PFCOUNT lp:types:uv
redis-cli -p 6391 GEOADD lp:types:places 121.47 31.23 Shanghai 116.40 39.90 Beijing
redis-cli -p 6391 GEODIST lp:types:places Shanghai Beijing km
```

Bitmap 把位偏移对应到布尔状态，上例 BITCOUNT 为 2；偏移过大会分配大量空间，用户 id 稀疏时不一定合适。HyperLogLog 估计不同成员数量，不保存可枚举成员列表；小样本通常接近 2，但它是近似结构，不能作为账务唯一性证明。GEO 使用地理索引能力，距离是模型估计，不是道路行程；经纬度输入次序不能颠倒。

## 4. 成本与选择边界

单个命令并不意味着恒定成本。LPOP 两端访问和从中间按位置访问不同；SMEMBERS、HGETALL 返回全体成员，对大键会占 CPU、网络和客户端内存。可用 SSCAN/HSCAN/ZSCAN 增量扫描，但迭代期间变化和重复结果需要由应用处理。

Streams 是持久消息日志式结构，消费组、确认与重投语义在后续协调章节讲解；不要因为 List 能 LPUSH/RPOP 就认为已经解决任务可靠消费。

## 5. 错误驱动

把整数计数键写成 'abc' 后 INCR 会失败。Hash 字段自增要求原值可解析为整数；Sorted Set 分数采用浮点表示，不适合不加设计就存高精度货币。排行榜“并列”是否允许相同名次属于业务口径，不能把 ZRANK 直接当体育比赛排名规则。

## 6. 练习与验收

1. 为点赞去重、排行榜与每日活跃各选类型，验收说明是否需要精确成员、排序和近似误差。
2. 给榜单加入同分成员，记录排序并解释；再实现业务所需的并列名次规则。
3. 为大 Hash 查询设计分页读取，验收不以一次 HGETALL 作为所有规模的通用方案。

## 7. 资料链接

- [Redis：数据类型总览](https://redis.io/docs/latest/develop/data-types/)
- [Redis：Sorted Sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/)
- [Redis：HyperLogLog](https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/)
