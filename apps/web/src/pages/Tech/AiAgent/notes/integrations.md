## 1. 本节定位：选型与集成边界

本节是 MCP、框架与多智能体的选型概览，配合可运行的交接契约实验。先理解单 Agent 循环，再根据实际问题引入这些能力。本节不替代 MCP 协议实现教程或某个框架的完整使用指南；MCP 深入学习可进入 Tech 下已有的 MCP 学习路径。

环境 Node.js 22+；资料核对日期 2026-10-20。MCP 以当前官方架构为参照，具体规范版本、传输与 SDK 必须成组核对；LangGraph 以 JavaScript 官方文档为参照，不固定易变的包版本。

## 2. 三类能力解决不同问题

| 内容       | 定义及例子                                                   | 何时引入                         |
| ---------- | ------------------------------------------------------------ | -------------------------------- |
| MCP        | 模型上下文协议；例如让多个应用通过统一接口发现和调用资料搜索 | 同一外部能力要被多个 AI 应用复用 |
| Agent 框架 | 封装模型、工具与中间件等开发机制                             | 重复编排代码增加，需要统一约定   |
| 编排运行时 | 提供图状态、检查点、暂停恢复等执行机制                       | 多步骤长任务需要明确的恢复控制   |
| 多智能体   | 多个有明确职责和上下文的 Agent 协作                          | 子任务能独立完成，分工有可测收益 |

MCP 不规定整个 Agent 如何决策，也不替代业务授权。框架不保证任务正确；多智能体会增加调用次数、信息交接和故障面。先用评估判断收益，再决定是否扩展。

## 3. MCP 与框架的接入检查表

MCP 中 **Host** 是容纳 AI 功能与策略的应用，**Client** 负责协议交互，**Server** 提供能力。**Tools** 暴露可调用动作，**Resources** 提供可读取内容，**Prompts** 提供可选用的提示模板。例如“查订单”是工具，“产品手册”是资源，“分析工单模板”是提示；实际支持范围需要逐项发现和核对。

接入顺序：确定服务来源和允许权限 → 选择并核对协议/SDK 版本 → 建立传输 → 发现能力 → 转成应用允许提供给模型的工具 → 校验并调用 → 规范化结果 → 关闭连接。远程授权与本地进程权限分开处理，不能假设服务描述可信。

框架选型时检查：工具调用记录能否读取；模型与业务逻辑能否替换和测试；状态是否真正持久化；恢复是否重放副作用；人工介入、取消、错误和费用统计是否满足需求。LangChain 可提供 Agent 循环抽象，LangGraph 提供更细的状态与执行控制；本路线仍以原生 Node.js 实验作为机制基础。

## 4. 完整实验：受约束的子任务交接

先预测：子任务返回正文就算完成吗？引用不在允许来源中时能否合并？保存为 `integrations.mjs`，运行 `node integrations.mjs`：

```js
import assert from 'node:assert/strict';
const job = { id: 'J-1', topic: '退款期限', allowedSources: ['refund-v1'] };

/**
 * 教学 worker 替身；仅返回任务需要的信息。
 */
async function worker(task) {
  return {
    jobId: task.id,
    status: 'completed',
    facts: [{ text: '退款期限七天', source: 'refund-v1' }],
  };
}

/**
 * 主流程在合并前检查交接身份、状态和来源。
 */
function accept(task, result) {
  if (result.jobId !== task.id) throw new Error('wrong_job');
  if (result.status !== 'completed') throw new Error('worker_incomplete');
  if (!Array.isArray(result.facts) || !result.facts.length) {
    throw new Error('missing_facts');
  }
  for (const fact of result.facts) {
    if (
      typeof fact.text !== 'string' ||
      !fact.text.trim() ||
      !task.allowedSources.includes(fact.source)
    ) {
      throw new Error('invalid_evidence');
    }
  }
  return result.facts;
}

const result = await worker(job);
assert.equal(accept(job, result).length, 1);
assert.throws(() => accept(job, { ...result, jobId: 'J-2' }), /wrong_job/);
assert.throws(
  () =>
    accept(job, {
      ...result,
      facts: [{ text: '任意内容', source: 'private' }],
    }),
  /invalid_evidence/,
);
assert.throws(
  () => accept(job, { ...result, status: 'failed' }),
  /worker_incomplete/,
);
console.log('valid handoff accepted; wrong job, source and status rejected');
```

## 5. 结果与分工原则

只有任务 ID、完成状态和来源契约都通过的结果进入主流程。引用合法还不够，后续仍需核验断言是否由原文支持。worker 返回的“完成”也不能被当成真实业务状态提交。

任务交接还应包含截止时间、总预算份额、允许工具和明确验收条件。子 Agent 只获得完成该子任务所需上下文，不复制所有用户历史和权限。并行 worker 的预算要汇总，失败要能取消或降级，不能无限递归派生。

## 6. 错误与适用边界

错误做法是“一个 Agent 查资料，另一个直接相信它”，没有证据和任务标识，合并后难以追踪错误。修正为结构化交接、来源验证与全局任务状态。

实验是单进程函数调用的交接验证，没有启动多个模型，也没有实现 MCP Server 或框架互通。真实接入应另做集成测试，覆盖协议能力发现、调用失败、连接关闭和权限拒绝。Skills 一般用于组织可复用指令与资源，不能自动提供执行权限或代替工具接口。

## 7. 练习与验收

1. 将任务拆为资料搜索与引用审查。验收：输入输出契约独立，失败结果不会混入成功结果。
2. 给主任务分配统一预算。验收：两个 worker 合计不可超支，超限后不再派发新请求。
3. 对直接 HTTP、MCP 和框架做选型记录。验收：写明实际复用/恢复需求及新增成本，不只按流行度选择。

## 8. 资料链接

- [MCP：官方架构与原语](https://modelcontextprotocol.io/docs/learn/architecture)
- [LangChain：开源 Agent 技术栈](https://www.langchain.com/oss-overview)
- [LangGraph：JavaScript 概览](https://docs.langchain.com/oss/javascript/langgraph/overview)
