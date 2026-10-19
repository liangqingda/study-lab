## 1. 项目目标与验收边界

做一个“查询指定主题并生成带来源报告草稿”的多步任务助手，组合 search_docs、read_doc、draft_report 三个工具。先把控制逻辑做成可验证的本地程序，再替换模型与检索依赖。

环境 Node.js 22+，无需安装依赖或密钥。以下是可复现的教学系统，决策器和文档库均为替身，草稿只保存在当前运行的内存状态；没有启动真实模型、MCP、数据库或发送服务。资料核对日期 2026-10-20。

## 2. 契约与验收标准

| 部件         | 输入 → 输出               | 必须满足的约束                         |
| ------------ | ------------------------- | -------------------------------------- |
| search_docs  | query → 文档 ID 列表      | 只检索当前用户可见资料                 |
| read_doc     | id → 正文和来源 ID        | 只能读取本任务已检索到的可见 ID        |
| draft_report | source + quote → 报告草稿 | 来源已读取，引用为原文连续片段         |
| 决策器       | 已执行结果 → tool / final | 不能直接调用业务函数或修改真实历史     |
| 循环控制     | 决策与状态 → 最终状态     | 限轮数、重复请求、工具白名单与最终结果 |

**证据链**是从检索 ID、实际读取正文到报告引用的可追溯关系。**依赖注入**是把决策器作为参数传入，测试时替换而不改控制逻辑。草稿成功不代表已经向外发送；发送应另有独立审批。

## 3. 完整可运行实现

先预测：只搜索到文档但没读取，就能引用吗？模型直接说“报告已生成”能通过吗？保存为 `project.mjs`，运行 `node project.mjs`：

```js
import assert from 'node:assert/strict';
const docs = [
  { id: 'refund-v1', owner: 'u1', text: '退款期限为七天。' },
  { id: 'private', owner: 'u2', text: '退款期限按私人协议执行。' },
];

/**
 * 根据观察选择步骤的确定性决策器；稍后可替换成模型适配器。
 */
function model(history) {
  const last = history.at(-1);
  if (!last)
    return { type: 'tool', name: 'search_docs', input: { query: '退款' } };
  if (last.name === 'search_docs') {
    if (!last.output.length)
      return { type: 'final', answer: 'insufficient_evidence' };
    return { type: 'tool', name: 'read_doc', input: { id: last.output[0] } };
  }
  if (last.name === 'read_doc')
    return {
      type: 'tool',
      name: 'draft_report',
      input: { source: last.output.id, quote: last.output.text },
    };
  return { type: 'final', answer: last.output.report };
}

/**
 * 校验本实验仅含字符串字段的精确对象结构。
 */
function exact(input, keys) {
  return (
    input !== null &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    Object.keys(input).length === keys.length &&
    keys.every(
      (key) =>
        Object.hasOwn(input, key) &&
        typeof input[key] === 'string' &&
        input[key].trim().length > 0 &&
        input[key].length <= 200,
    )
  );
}

/**
 * 在可信用户身份下执行任务，保留结果并验证最后的草稿。
 */
async function run(decide, owner, maxTurns = 4) {
  const state = { history: [], found: [], read: null, draft: null };
  const seen = new Set();
  const tools = {
    search_docs(input) {
      if (!exact(input, ['query'])) throw new Error('invalid_input');
      state.found = docs
        .filter((doc) => doc.owner === owner && doc.text.includes(input.query))
        .map((doc) => doc.id);
      return state.found;
    },
    read_doc(input) {
      if (!exact(input, ['id'])) throw new Error('invalid_input');
      const doc = docs.find(
        (row) => row.id === input.id && row.owner === owner,
      );
      if (!state.found.includes(input.id) || !doc)
        throw new Error('not_readable');
      state.read = { id: doc.id, text: doc.text };
      return state.read;
    },
    draft_report(input) {
      if (!exact(input, ['source', 'quote'])) throw new Error('invalid_input');
      if (
        !state.read ||
        state.read.id !== input.source ||
        !state.read.text.includes(input.quote)
      )
        throw new Error('invalid_evidence');
      state.draft = { report: `${input.quote} [${input.source}]` };
      return state.draft;
    },
  };
  for (let turn = 0; turn < maxTurns; turn++) {
    const action = await decide(structuredClone(state.history));
    if (action?.type === 'final') {
      if (state.draft && action.answer === state.draft.report) {
        return { status: 'completed', ...state.draft, history: state.history };
      }
      if (
        action.answer === 'insufficient_evidence' &&
        state.history.at(-1)?.name === 'search_docs' &&
        state.found.length === 0
      ) {
        return { status: 'insufficient_evidence', history: state.history };
      }
      throw new Error('unverified_final');
    }
    if (action?.type !== 'tool' || !Object.hasOwn(tools, action.name)) {
      throw new Error('unknown_tool');
    }
    const key = JSON.stringify([action.name, action.input]);
    if (seen.has(key)) throw new Error('repeated_call');
    seen.add(key);
    const output = tools[action.name](action.input);
    state.history.push({ name: action.name, output: structuredClone(output) });
  }
  return { status: 'turn_limit', history: state.history };
}

const result = await run(model, 'u1');
assert.equal(result.status, 'completed');
assert.equal(result.report, '退款期限为七天。 [refund-v1]');
assert.deepEqual(
  result.history.map((step) => step.name),
  ['search_docs', 'read_doc', 'draft_report'],
);
assert.equal((await run(model, 'u3')).status, 'insufficient_evidence');
assert.equal((await run(model, 'u1', 1)).status, 'turn_limit');
await assert.rejects(
  run(
    () => ({ type: 'tool', name: 'read_doc', input: { id: 'private' } }),
    'u1',
  ),
  /not_readable/,
);
await assert.rejects(
  run(
    () => ({ type: 'tool', name: 'search_docs', input: { query: '退款' } }),
    'u1',
  ),
  /repeated_call/,
);
await assert.rejects(
  run(() => ({ type: 'final', answer: '报告已生成' }), 'u1'),
  /unverified_final/,
);
await assert.rejects(
  run(
    (history) =>
      history.at(-1)?.name === 'read_doc'
        ? {
            type: 'tool',
            name: 'draft_report',
            input: { source: 'refund-v1', quote: '退款期限为一年。' },
          }
        : model(history),
    'u1',
  ),
  /invalid_evidence/,
);
console.log(result.report);
console.log(
  'normal, empty, limit, permission, repeat, final and evidence checked',
);
```

## 4. 沿执行结果复盘

| 轮次 | 动作         | 新事实/结果                      |
| ---- | ------------ | -------------------------------- |
| 1    | search_docs  | 仅得到 refund-v1，u2 资料不可见  |
| 2    | read_doc     | 获取退款期限原文，建立可引用证据 |
| 3    | draft_report | 校验连续原文后得到带来源草稿     |
| 4    | final        | 答案与真实草稿一致才 completed   |

预期输出为 `退款期限为七天。 [refund-v1]` 和用例通过提示。u3 没有可见资料，因此返回证据不足。伪造来源读取、循环重复、跳过工具直接宣称完成以及改写为“一年”都被拒绝。

## 5. 逐步替换真实依赖

先把 model 换成模型 API 适配器，保留循环与工具策略；在适配器中完成真实消息角色、调用 ID、工具结果和结束原因映射。再把 search_docs 换成真实检索，把 read_doc 换成受权访问；最后才考虑持久化草稿、队列与人工审批。

每替换一个依赖，先继续跑固定控制用例，再增加对应集成测试。调用模型时记录真实型号、提示词版本、usage、耗时和错误；检索集成测访问隔离与来源时效；数据库操作只使用 study_lab，并在写入前确认 current_database()，不清空已有数据。

## 6. 教学简化与错误边界

连续原文校验能拒绝伪造引用，但片面截取仍可能改变含义；真实报告应检查上下文和断言支持，不能宣称已经解决所有事实错误。当前重复键依赖 JSON 字段顺序，生产实现应规范化参数；资料中的恶意指令也需要额外防护。

代码省略异步工具超时、持久化和供应商错误反馈。接入异步服务时要 await 工具结果、传取消信号，并区分可纠正输入、权限拒绝和系统故障。这里最大 4 轮包含 3 次工具调用与 1 次 final，工具数量与轮数不能混淆。

## 7. 练习与验收

1. 把主题作为任务输入传入决策器。验收：退款、配送、未知主题各有真实依据或明确无依据结果，不能固化答案。
2. 给工具增加一次故障与恢复。验收：有限重试，失败有记录，未成功生成草稿时不能完成。
3. 接入真实模型后运行留出任务集。验收：报告实际成功率、违规次数、耗时与费用，区分离线控制验证和真实模型效果。
4. 增加“发送草稿”的审批阶段。验收：审批绑定任务和参数，重放不会重复发送，关闭界面不被视为撤销已完成操作。

## 8. 资料链接

- [Anthropic：工具调用](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Anthropic：Agent 评估](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [LangGraph：检查点与恢复](https://docs.langchain.com/oss/javascript/langgraph/persistence)
