## 1. 学习范围与起点

本路线面向调用已有大模型的应用开发，以 TypeScript / Node.js 为主线。目标是做出能使用工具、完成多步任务且结果可验证的助手。Python 也能实现相同机制，可在有数据科学或模型训练需求时再补充。

准备 Node.js 22 或更高版本、终端和编辑器，运行 `node --version` 确认环境。笔记的离线实验使用 `.mjs` 文件，无需安装依赖或提供密钥；实际项目可使用 TypeScript。资料核对日期为 **2026-10-20**。模型训练、微调、语音、视觉和浏览器操作属于按业务需要选学的分支，本路线先建立文本与工具的通用基础。

## 2. 三种应用形态

| 术语               | 含义                                   | 最小场景与结果                               |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| LLM（大语言模型）  | 根据上下文生成文本或结构化内容的模型   | 输入问题，得到一次回答；回答仍需验证         |
| Workflow（工作流） | 程序预先安排步骤及条件分支             | 固定执行“提取字段 → 校验 → 保存”             |
| Agent（智能体）    | 模型结合工具反馈动态决定后续行动的应用 | 查库存后，根据有无库存决定继续查替代品或结束 |
| Tool（工具）       | 应用允许模型请求执行的能力             | `get_stock({ sku: 'book' })` 返回库存 3      |
| State（状态）      | 当前任务已经发生的事实和进展           | `status: 'running'`、已得到库存 3            |

同一产品可以同时使用固定流程和 Agent。先给任务定义完成标准，例如“查到库存并列出来源”，再判断哪些步骤交给模型。开放程度提高时，要同步增加停止条件与验证。

## 3. 必备编程知识怎么用到这里

- **异步与 Promise**：外部请求需要等待；`await lookup()` 得到结果后再处理。独立只读请求可并行，有数据依赖的步骤应顺序执行。
- **HTTP**：理解方法、状态码、请求头和响应体。HTTP 200 只说明请求层面成功，业务结果仍可能为空或失败。
- **JSON**：数据交换格式；`JSON.parse('{"stock":3}')` 得到对象，但不保证字段符合业务要求。
- **类型与运行时校验**：TypeScript 在开发阶段检查类型；网络数据进入程序后仍要校验。`as Order` 不会让错误 JSON 变正确。
- **数据库与 Git**：前者保存任务、消息和审计信息，后者记录代码及提示词版本。先学查询、约束、事务和差异审阅即可起步。

## 4. 完整实验：异步结果如何进入任务状态

先预测：如果直接读取 Promise 的 `stock` 字段会得到什么？发生异常后，任务能否仍被标记为完成？保存为 `foundations.mjs`，运行 `node foundations.mjs`：

```js
import assert from 'node:assert/strict';

/**
 * 模拟一个异步只读工具，不访问数据库。
 */
async function lookup(sku) {
  if (sku !== 'book') throw new Error('unknown sku');
  return { sku, stock: 3 };
}

/**
 * 根据真实执行结果更新任务状态。
 */
async function run(sku) {
  const state = { status: 'running', result: null, error: null };
  try {
    state.result = await lookup(sku);
    state.status = 'completed';
  } catch (error) {
    state.status = 'failed';
    state.error = error.message;
  }
  return state;
}

const pending = lookup('book');
assert.equal(pending.stock, undefined);
assert.equal((await pending).stock, 3);
assert.deepEqual(await run('book'), {
  status: 'completed',
  result: { sku: 'book', stock: 3 },
  error: null,
});
assert.equal((await run('missing')).status, 'failed');
console.log('await result → completed; unknown sku → failed');
```

## 5. 结果为什么成立

| 顺序 | 输入/动作       | 可观察状态                        |
| ---- | --------------- | --------------------------------- |
| 1    | 调用 lookup     | 先得到 Promise，尚不是库存对象    |
| 2    | await book 查询 | 得到库存 3，任务变成 completed    |
| 3    | 查询 missing    | 抛出错误，被捕获后状态变成 failed |

实验使用确定性的工具替身，验证异步和状态边界，没有调用模型。模型接入以后，也应以工具实际结果更新状态，不能依据模型说“完成了”直接认定业务成功。

## 6. 错误、修正与适用边界

错误写法是 `const result = lookup('book'); result.stock`：读取结果为 `undefined`，因为漏掉等待。修正为 `const result = await lookup('book')`。另一个错误是在 `finally` 中无条件设为 completed，会覆盖失败状态；finally 应用于释放资源等总要执行的收尾工作。

这个实验没有模拟网络故障、并发写入或持久化。接入真实服务时，应增加超时、资源级权限和明确的错误分类。固定表单校验、确定性金额计算等步骤优先由程序完成。

## 7. 练习与验收

1. 增加两个商品，用 `Promise.all` 查询。验收：能保留输入与结果的对应关系，并说明单个 Promise 拒绝会如何影响整体等待。
2. 将未知商品改成明确的 not_found 结果。验收：能区分“合法查询但不存在”和“执行系统故障”。
3. 为一个真实需求画出流程。验收：每步写明输入、输出、是否需要模型及任务完成标准。

## 8. 资料链接

- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Node.js：全局 API、fetch 与 AbortSignal](https://nodejs.org/api/globals.html)
