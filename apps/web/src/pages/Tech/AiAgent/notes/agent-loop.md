## 1. Agent 循环在循环什么

应用反复执行“提供上下文 → 获取模型决策 → 校验并执行工具 → 记录结果 → 再次决策”。工具返回的新事实会影响下一步。**Observation（观察）**是实际工具反馈；**Action（行动）**是待执行请求；**终止条件**定义何时回答、失败、暂停或主动停止。

ReAct 常用来描述交替进行推理与行动的模式。工程上应记录工具名、参数摘要、可观察结果与决策状态，不要求或依赖模型暴露私有思维过程。本节用确定性决策器代替模型，验证循环控制；环境 Node.js 22+。

## 2. 决策与预算的最小契约

| 输入/约束      | 示例                         | 作用                 |
| -------------- | ---------------------------- | -------------------- |
| 历史工具结果   | 库存为 0                     | 促使下一轮查询替代品 |
| 决策类型       | tool / final                 | 明确继续还是结束     |
| 最大轮数       | 最多 4 次决策                | 防止无限执行         |
| 重复调用限制   | 相同只读工具和参数不反复执行 | 防止没有新信息的循环 |
| 时间与费用预算 | 总截止时间、用量上限         | 独立于轮数控制资源   |

轮数、工具调用次数和 Token 数不是同一指标，一轮可能请求多个工具。预算要在发请求前检查，并为本次可能消耗留余量；并发子任务也必须共享总预算。

## 3. 完整实验：工具结果改变下一步

先预测：库存为 0 时会直接回答有货吗？一直要求同一次查询的决策器会停吗？保存为 `agent-loop.mjs`，运行 `node agent-loop.mjs`：

```js
import assert from 'node:assert/strict';
const tools = {
  get_stock: () => ({ stock: 0 }),
  get_alternative: () => ({ sku: 'book-2', stock: 4 }),
};

/**
 * 教学决策器根据观察选择下一步，不是真实模型。
 */
function decide(history) {
  const last = history.at(-1);
  if (!last) return { type: 'tool', name: 'get_stock', input: {} };
  if (last.name === 'get_stock' && last.result.stock === 0) {
    return { type: 'tool', name: 'get_alternative', input: {} };
  }
  return { type: 'final', answer: `可选 ${last.result.sku}` };
}

/**
 * 为教学循环加入白名单、重复检测和轮数上限。
 */
async function run(model, maxTurns = 4) {
  const history = [];
  const seen = new Set();
  for (let turn = 0; turn < maxTurns; turn++) {
    const action = await model(structuredClone(history));
    if (action.type === 'final' && typeof action.answer === 'string') {
      return { status: 'completed', answer: action.answer, history };
    }
    if (action.type !== 'tool' || !Object.hasOwn(tools, action.name)) {
      return { status: 'invalid_action', history };
    }
    if (!action.input || Object.keys(action.input).length !== 0) {
      return { status: 'invalid_input', history };
    }
    const key = action.name;
    if (seen.has(key)) return { status: 'repeated_call', history };
    seen.add(key);
    history.push({ name: action.name, result: await tools[action.name]() });
  }
  return { status: 'turn_limit', history };
}

const success = await run(decide);
assert.equal(success.answer, '可选 book-2');
assert.equal(success.history.length, 2);
const repeat = await run(() => ({
  type: 'tool',
  name: 'get_stock',
  input: {},
}));
assert.equal(repeat.status, 'repeated_call');
assert.equal((await run(decide, 1)).status, 'turn_limit');
console.log('completed with 2 tools; repeated_call; turn_limit');
```

## 4. 逐轮观察

| 轮次 | 已知信息     | 决策            | 执行后的事实     |
| ---- | ------------ | --------------- | ---------------- |
| 1    | 还没有查询   | get_stock       | 库存 0           |
| 2    | 原商品无货   | get_alternative | book-2 库存 4    |
| 3    | 有替代品信息 | final           | 生成可选商品回答 |

循环将反馈传回决策器，才能形成连续任务。仅在前端依次展示三个固定字符串，不能验证模型是否根据观察选择工具。这里也只验证循环，不证明真实模型有同样成功率。

## 5. 接入真实模型时的替换点

保留 run 的控制职责，将 model 替换成供应商 API 适配器：读取消息、工具定义与历史，解析文本或工具调用。真实协议还需保留完整 assistant 内容、call ID 和每个 tool_result，不能把本例简化历史直接提交给 API。

final 只是模型提议结束，应用仍需验证是否有证据、业务是否完成、输出是否符合契约。工具执行错误应被分类：输入可修正时反馈给模型；权限拒绝结束或请求合法授权；不可恢复故障返回 failed；遇到需要用户判断的步骤进入 waiting 状态。

## 6. 失败与适用边界

错误写法是 `while (true) await model()`，既不反馈工具结果，也无退出限制，可能不断产生请求。修正是明确状态、完整回传观察、限制预算并记录停止原因。

本例所有工具都没有参数且只读，所以只按工具名检测重复。真实工具需规范化参数、考虑数据时效；轮询任务允许有间隔地重复读取，不能照搬永久禁止重复的规则。单次模型或工具调用挂起也不会被轮数限制打断，需要独立超时与取消机制。

## 7. 练习与验收

1. 给 get_stock 增加 SKU 参数。验收：不同 SKU 可查询，同 SKU 无新增信息时受重复策略限制。
2. 注入一次临时工具故障。验收：保留失败观察，有限重试后明确结束，不能报告查询成功。
3. 给 final 增加证据要求。验收：没有对应工具结果的商品不能进入答案。

## 8. 资料链接

- [Anthropic：Agent 的反馈循环与停止条件](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic：客户端工具调用协议](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
