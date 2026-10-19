## 1. 把自然语言转成有边界的数据

本阶段学习提示词和运行时数据校验。目标是让程序可靠地区分“可接受结果、缺信息、无效输出”，而不是假定模型每次都遵循格式。环境为 Node.js 22+，实验不调用模型；供应商功能以 2026-10-20 官方文档为参照。

**Prompt（提示词）**是传给模型的任务指令及上下文。例如“从用户描述提取工单类别；只允许 billing/technical；没有信息就返回 unknown”。**Few-shot（少量示例）**用代表性输入输出解释规则，例如“无法登录 → technical”。示例要覆盖歧义与缺信息，避免只展示简单成功输入。

## 2. 三层约束各负责什么

| 层次                     | 作用                                                | 例子与局限                                                  |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| 指令                     | 说明任务、边界、输入来源和失败处理                  | “缺订单号时追问”，仍可能被误解                              |
| 结构化输出 / JSON Schema | 描述字段、类型、枚举等数据形状；部分 API 可约束生成 | status 只允许 ready / needs_input；是否支持取决于模型与 API |
| 业务校验                 | 在应用里检查权限、引用存在性和业务规则              | ready 时 orderId 必须存在，且属于当前用户                   |

**JSON Schema** 是描述 JSON 数据结构的标准，不是某家模型专用格式。`{"type":"integer","minimum":1}` 表示至少为 1 的整数。合法 JSON 只通过语法层；结构正确也不代表事实正确或有执行权限。

## 3. 完整实验：语法、类型与业务不变量

先预测：字符串 `"2"` 能否当数量 2？JSON 没有语法错误是否就可以保存？保存为 `structured-output.mjs`，运行 `node structured-output.mjs`：

```js
import assert from 'node:assert/strict';

/**
 * 校验固定业务结构；实际项目可使用 Zod 等契约库。
 */
function parseTicket(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, reason: 'invalid_shape' };
  }
  const allowed = ['status', 'orderId', 'quantity'];
  if (Object.keys(data).some((key) => !allowed.includes(key))) {
    return { ok: false, reason: 'unknown_field' };
  }
  if (!['ready', 'needs_input'].includes(data.status)) {
    return { ok: false, reason: 'invalid_status' };
  }
  if (!Number.isInteger(data.quantity) || data.quantity < 1) {
    return { ok: false, reason: 'invalid_quantity' };
  }
  if (
    data.status === 'ready' &&
    (typeof data.orderId !== 'string' || !/^O-\d+$/.test(data.orderId))
  ) {
    return { ok: false, reason: 'missing_order' };
  }
  if (data.status === 'needs_input' && data.orderId !== null) {
    return { ok: false, reason: 'expected_null_order' };
  }
  return { ok: true, value: data };
}

assert.equal(parseTicket('not json').reason, 'invalid_json');
assert.equal(
  parseTicket('{"status":"ready","quantity":"2"}').reason,
  'invalid_quantity',
);
assert.equal(
  parseTicket('{"status":"ready","quantity":2}').reason,
  'missing_order',
);
assert.equal(
  parseTicket('{"status":"ready","orderId":"O-1","quantity":2}').ok,
  true,
);
assert.equal(
  parseTicket('{"status":"needs_input","orderId":null,"quantity":1}').ok,
  true,
);
console.log('syntax → shape → business constraints checked');
```

## 4. 沿一次输出解释机制

初始输入是原始字符串；JSON.parse 先得到未知数据；形状校验拒绝非对象和未知字段；枚举、整数和跨字段规则进一步约束；最后得到可供业务处理的对象。本例的 needs_input 表示缺订单号，数量仍是已知正整数；数量也未知时，应扩展契约，而不是填造默认事实。

不要用 `Number(data.quantity)` 把任意输入悄悄转成数值。这可能掩盖模型没有遵守协议的问题。是否允许转换应由业务明确规定，并留下可观测记录。

## 5. 提示词如何迭代

先写清角色任务、允许的数据来源、输出契约和缺信息处理；用正常、歧义、缺字段、恶意输入组成固定样例；观察失败类别后再修改指令或示例。将指令版本和评估结果一同记录。

例如把用户原文包在清晰的数据字段中，并说明它是待分析内容，不能覆盖系统规则。需要纠正输出时，向模型反馈“quantity 必须是正整数”等可执行错误，设置最多一次或两次修正机会；权限失败或事实缺失不能靠反复要求“重新生成”解决。

## 6. 常见错误与边界

错误示例：`JSON.parse('{"quantity":"2"}').quantity + 1` 得到字符串 `"21"`。原因是解析成功但类型错误，修正是先校验再进入计算。

TypeScript 的类型断言只影响静态检查；提示词中的“严格 JSON”也不等于 API 提供的结构化生成能力。即便供应商支持严格 schema，仍应处理拒答、截断、工具错误及业务校验。模型生成的 SQL、HTML 或命令尤其不能因格式正确就直接执行。

## 7. 练习与验收

1. 增加 note 字段及长度限制。验收：缺字段、超长和未知字段都有明确结果。
2. 设计“数量也未知”的契约。验收：能表示真实未知状态，不强行填 1。
3. 建立 8 条字段提取样例。验收：包含歧义和恶意文本，修改提示词前后使用同一评估集。

## 8. 资料链接

- [JSON Schema：对象与属性](https://json-schema.org/understanding-json-schema/reference/object)
- [Anthropic：Messages API 与输出配置](https://platform.claude.com/docs/en/api/messages/create)
- [Anthropic：上下文工程与示例设计](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
