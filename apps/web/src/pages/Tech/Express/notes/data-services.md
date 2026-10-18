## 1. 分层解决的是变化边界

路由把 HTTP 输入转为业务参数；业务函数表达规则；存储适配器处理数据库或其他依赖。不是所有服务都需要 Controller、Service、Repository 三套空壳，但业务规则应该能脱离监听端口验证。

本节用纯 Node.js 的依赖注入实验说明边界，不连接真实数据库。涉及 PostgreSQL 时，连接池、事务和参数化查询是独立约束，不会因“已分层”自动正确。

## 2. 核心术语

| 术语     | 定义                           | 实际价值                   |
| -------- | ------------------------------ | -------------------------- |
| 依赖注入 | 调用方提供依赖能力             | 测试可替换保存行为         |
| 连接池   | 复用有限数量的数据库连接       | 防止每个请求都建立无限连接 |
| 事务边界 | 一组操作一起提交或回滚的范围   | 保证业务不变量             |
| finally  | 无论正常还是失败都执行的清理段 | 归还连接，结束资源占用     |

事务必须在同一个数据库连接上完成；从池直接发 BEGIN，再通过池发 UPDATE，可能用到不同连接。外部 HTTP 调用通常不能被数据库 ROLLBACK 撤销。

## 3. 完整实验：可注入的文章更新

先预测：保存失败时，原文章对象会不会已经被业务函数偷偷改掉？保存为 `service.mjs`，运行 `node service.mjs`：

```js
import assert from 'node:assert/strict';
function createRenameArticle({ find, save }) {
  return async (id, title) => {
    if (typeof title !== 'string' || !title.trim())
      throw new Error('INVALID_TITLE');
    const current = await find(id);
    if (!current) throw new Error('NOT_FOUND');
    const next = { ...current, title: title.trim() };
    await save(next);
    return next;
  };
}
const original = { id: '1', title: 'before' };
const stored = [];
const rename = createRenameArticle({
  find: async () => original,
  save: async (value) => stored.push(value),
});
assert.equal((await rename('1', ' after ')).title, 'after');
assert.equal(original.title, 'before');
assert.equal(stored[0].title, 'after');
const broken = createRenameArticle({
  find: async () => original,
  save: async () => {
    throw new Error('DB_DOWN');
  },
});
await assert.rejects(broken('1', 'new'), /DB_DOWN/);
assert.equal(original.title, 'before');
console.log('success and dependency failure verified');
```

预期输出 success and dependency failure verified。关键点是先构造 next 再保存，失败不会意外原地修改共享输入对象；这不等于真实数据库天然不会发生部分写入，真实多语句写入仍需事务。

## 4. 数据库操作的正确骨架

下面是结构示意，`pool` 由当前项目连接配置提供，不能单独复制就声称可运行：

```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE articles SET title=$1 WHERE id=$2', [title, id]);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

业务还要检查受影响行数和并发版本；ROLLBACK 自身失败也应有明确连接处置与错误记录策略，不应覆盖最初故障的证据。在本仓库，实际数据库开发和联调仅使用 DATABASE_URL 指向的 study_lab，任何写入前确认 current_database()，不清空已有数据。

## 5. 常见失败与边界

路由里混合 SQL、权限、邮件和 JSON 序列化，会使测试需要启动所有外部系统。修复是按真实职责提取纯规则与依赖接口，而不是把同一大函数搬到名为 service 的文件。

连接未释放会让后续请求等待；事务里等待远程慢接口会持有锁。应把可移出的等待移出事务，但必须重新审查这样做是否破坏一致性。超时不是“给 Promise.race 一下就好了”，底层操作可能还在执行，需要取消或让资源最终清理。

## 6. 练习与验收

1. 给业务函数加入版本条件，模拟两个更新同时提交；验收能发现冲突，不用最后写覆盖一切。
2. 模拟 find、save 各自失败，验收不会错误返回成功或修改原始对象。
3. 画出一次数据库事务和一次外部通知的边界，说明通知失败如何重试且不重复创建文章。

## 7. 资料链接

- [Express：数据库集成](https://expressjs.com/en/guide/database-integration.html)
- [node-postgres：事务](https://node-postgres.com/features/transactions)
- [node-postgres：连接池](https://node-postgres.com/features/pooling)
