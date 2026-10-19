## 1. 模型每一步应该看到什么

**上下文工程**是在有限窗口内选择指令、历史、工具、资料和状态，让模型有足够信息完成当前步骤。更多内容不一定带来更好表现：重复日志、过期资料和无关工具会增加成本并干扰判断。

本节环境 Node.js 22+，只验证本地选择和隔离策略。字符数预算是教学近似，不是 Token 计数器；实际请求要使用对应模型的计数方法，并预留输出及协议开销。资料核对日期为 2026-10-20。

## 2. 三类信息不要混用

| 信息                  | 含义                       | 存取例子与结果                              |
| --------------------- | -------------------------- | ------------------------------------------- |
| 短期上下文            | 本次推理发送给模型的信息   | 当前问题 + 最近工具结果，直接影响这一次输出 |
| 任务状态 / Checkpoint | 保存当前进度，便于恢复     | 已查完库存但未生成报告，恢复时不从头开始    |
| 长期记忆              | 跨任务保留且按需读取的信息 | 经确认的语言偏好，在后续任务中检索加载      |

**Compaction（压缩）**用摘要替换部分长历史，例如保留目标、关键决定、来源和待办，丢弃重复日志。**按需加载**先传文件 ID 或路径，在需要时通过工具读取内容。**TTL（有效期）**限制信息保留时间，例如 10 分钟前的临时库存不应当作当前库存。

## 3. 信息选择的执行顺序

先确定当前身份和任务；按权限与时效筛选候选记忆；固定保留任务约束、当前请求和未解决事项；再为相关资料排序；在剩余预算中装入内容；最后记录本轮真正发送了哪些来源。

摘要也可能遗漏或失真，不能替代权威记录。金额、资源 ID、用户同意的具体操作和未完成状态应保存为结构化字段；工具调用和对应结果要成对保留，避免破坏供应商消息协议。

## 4. 完整实验：先隔离，再选择

先预测：更高分的其他用户记忆能否入选？已过期信息会不会抢占预算？保存为 `context-memory.mjs`，运行 `node context-memory.mjs`：

```js
import assert from 'node:assert/strict';
const now = 1_000;
const records = [
  { id: 'private', owner: 'u2', expiresAt: 2000, score: 9, text: 'secret' },
  { id: 'expired', owner: 'u1', expiresAt: 900, score: 8, text: 'old stock' },
  { id: 'language', owner: 'u1', expiresAt: 2000, score: 3, text: '中文' },
  { id: 'goal', owner: 'u1', expiresAt: 2000, score: 2, text: '查库存' },
];

/**
 * 先按可信身份与有效期筛选，再在字符预算内选择。
 */
function select(owner, budget) {
  const chosen = [];
  let used = 0;
  const visible = records
    .filter((row) => row.owner === owner && row.expiresAt > now)
    .sort((a, b) => b.score - a.score);
  for (const row of visible) {
    if (used + row.text.length > budget) continue;
    chosen.push(row.id);
    used += row.text.length;
  }
  return { chosen, used };
}

assert.deepEqual(select('u1', 5), { chosen: ['language', 'goal'], used: 5 });
assert.deepEqual(select('u1', 2).chosen, ['language']);
assert.deepEqual(select('u3', 5).chosen, []);
console.log('u1: language + goal; foreign and expired records excluded');
```

## 5. 结果与记忆写入策略

u2 的 private 即使分数最高，也在排序前被排除；expired 在有效期检查中排除；u1 的两段文字分别占 2 与 3 个 JavaScript 字符单位，因此预算 5 可容纳两段。不同文字的字符单位与 Token 的映射会变化，不能把 used 用于计费。

写入长期记忆时还要记录来源、确认状态、创建及更新时间、所属用户和有效期。区分用户明确偏好与模型推测，例如“这次请用英文”不一定表示永久改成英文。敏感内容最小化保存；支持用户查看、纠正和删除。删除需要覆盖原始记录、检索索引和相关缓存。

## 6. 错误与边界

错误做法是先从全体用户中取 Top-K，再过滤身份：其他用户内容可能已经进入重排序器或外部服务，且可能挤掉合法候选。修正为在可见数据集内检索和排序。

另一个错误是简单删除最旧消息，丢失任务目标或对应 tool_result。修正为保留结构化任务事实和协议完整性，并对摘要做样例评估。缓存命中只表示复用了计算，不等于信息仍然有效或被正确授权。

## 7. 练习与验收

1. 增加当前请求的固定预留区。验收：可选记忆再多也不会挤掉当前目标；固定内容超预算时明确失败。
2. 写一个压缩前后事实对照表。验收：目标、证据 ID、未完成步骤和授权范围均未丢失。
3. 为偏好记忆实现删除。验收：后续选择与检索不再返回删除内容，并说明缓存如何失效。

## 8. 资料链接

- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Node.js：字符串与运行时 API](https://nodejs.org/api/globals.html)
