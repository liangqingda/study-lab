## 1. 让长任务有明确进度

任务编排负责决定哪些步骤串行、哪些并行、何时分支、如何保存进度和恢复。适合用程序写死的规则继续交给程序；需要动态判断的局部步骤再由模型参与。环境 Node.js 22+；本节用本地状态模拟检查点与审批，不调用真实写入服务。

**状态机**用有限状态和合法迁移描述任务，例如 drafted → waiting_approval → completed。**Checkpoint（检查点）**保存恢复所需状态；**Human-in-the-loop（人工介入）**在关键点暂停，等待人补充信息、修改参数或确认操作。

## 2. 常见编排模式与结果

| 模式           | 最小例子                     | 选择依据                 |
| -------------- | ---------------------------- | ------------------------ |
| 串行           | 搜索 → 读取资料 → 写报告     | 后一步依赖前一步结果     |
| 并行           | 独立查询库存与配送时间       | 输入独立、无顺序写入冲突 |
| 路由           | 工单分类后进入账单或技术流程 | 有清晰类别和专门处理器   |
| 生成与校验循环 | 写报告 → 检查引用 → 有限修正 | 有可测验标准和修正上限   |
| 暂停与恢复     | 生成付款草稿 → 人确认 → 执行 | 关键动作需要真实授权     |

并行 Promise.all 不是事务，某项失败时其他已经发出的动作不会自动回滚。执行顺序影响数据时，应串行或使用业务事务；不要把外部写入全塞进并行调用。

## 3. 检查点应该保存哪些内容

至少保存 taskId、状态、输入摘要、已完成步骤、待处理动作、业务幂等键、创建时间和版本。恢复时用 taskId 读取，检查状态及版本，不能只凭模型重新推测进度。

确认需要绑定具体参数。用户同意“向 A 发送 100 元”，恢复后参数变成向 B 发送 1000 元时，旧确认无效。实际服务端要核对身份、参数摘要、有效期与可执行状态，并原子地领取任务，避免两个 worker 同时恢复。

## 4. 完整实验：序列化恢复与参数绑定

先预测：状态保存并恢复后，会自动获得确认吗？改变收件人还能用原批准吗？保存为 `workflows.mjs`，运行 `node workflows.mjs`：

```js
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

/**
 * 对本例固定字段计算动作指纹，不代替真实授权。
 */
function fingerprint(action) {
  return createHash('sha256')
    .update(JSON.stringify([action.to, action.body]))
    .digest('hex');
}

/**
 * 使用可信服务端审批记录执行待发送任务。
 */
function resume(task, approval, send) {
  if (task.status === 'completed') return task;
  if (task.status !== 'waiting_approval') throw new Error('invalid_state');
  if (
    !approval ||
    approval.taskId !== task.id ||
    approval.fingerprint !== fingerprint(task.action)
  ) {
    throw new Error('approval_required');
  }
  send(task.id, task.action);
  return { ...task, status: 'completed' };
}

const task = {
  id: 'T-1',
  status: 'waiting_approval',
  action: { to: 'team@example.test', body: '库存报告' },
};
const restored = JSON.parse(JSON.stringify(task));
const approval = { taskId: 'T-1', fingerprint: fingerprint(task.action) };
const sent = new Map();
const send = (key, action) => {
  if (!sent.has(key)) sent.set(key, action);
};
assert.throws(() => resume(restored, null, send), /approval_required/);
assert.throws(
  () =>
    resume(
      { ...restored, action: { ...restored.action, to: 'other@example.test' } },
      approval,
      send,
    ),
  /approval_required/,
);
const done = resume(restored, approval, send);
assert.equal(done.status, 'completed');
resume(restored, approval, send);
assert.equal(sent.size, 1);
console.log('paused → approved → completed; replay sent once');
```

## 5. 观察执行与提交点

| 时点 | 执行者/动作              | 状态与副作用                        |
| ---- | ------------------------ | ----------------------------------- |
| 1    | 应用生成草稿并序列化     | waiting_approval，未发送            |
| 2    | 恢复但无审批 / 参数变化  | 拒绝，仍未发送                      |
| 3    | 可信审批记录匹配当前动作 | send 写入内存 Map，再得到 completed |
| 4    | 从旧检查点重复恢复       | 同 taskId 被 send 去重，仍只有一条  |

审批对象只由本地测试代码构造；真实应用必须从认证过的审批流程读取，不接受模型或调用方自报 approved。序列化只展示恢复形状，Map 只展示单进程去重，进程退出后不持久化。

## 6. 故障与一致性边界

“外部发送成功、保存 completed 前崩溃”是关键窗口。只保存检查点不能保证外部副作用只发生一次；需要外部服务支持幂等键，或业务事务、outbox 和对账恢复策略。**Outbox**是在业务事务内先写待发送记录，再由 worker 投递；投递本身仍需处理重复。

错误做法是恢复后无条件从第一步重跑，导致重复付款或通知。修正为可恢复步骤、持久化状态和副作用幂等。审批期间可能过去很久，恢复时应重新验证价格、库存、权限和审批有效期。

## 7. 练习与验收

1. 增加 rejected 和 expired 状态。验收：拒绝或过期后不能继续发送。
2. 模拟发送后、保存完成前崩溃。验收：从旧检查点恢复不会再次造成业务副作用，并说明依赖哪个幂等保证。
3. 为两个 worker 设计任务领取。验收：有原子状态转换或版本检查，明确失败方的恢复行为。

## 8. 资料链接

- [LangGraph：持久化与检查点](https://docs.langchain.com/oss/javascript/langgraph/persistence)
- [LangGraph：状态、节点、错误与人工介入](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph)
