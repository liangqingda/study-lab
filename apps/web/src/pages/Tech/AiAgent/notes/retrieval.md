## 1. RAG 解决外部知识的使用问题

**RAG（检索增强生成）**先从外部资料中找证据，再让模型基于证据组织回答。它适合私有文档、经常更新的信息和需要来源的回答。查询结构化订单时，明确的 SQL 或业务 API 往往比把订单全部转成向量更直接。

环境 Node.js 22+；本节离线实现检索排序与证据门控。向量是手工教学数据，不调用 Embedding 服务，也不验证真实语义效果。资料参照 2026-10-20 的上下文与检索实践。

## 2. 从资料到答案的完整链路

| 阶段/术语             | 做什么                            | 例子与可观察结果                                |
| --------------------- | --------------------------------- | ----------------------------------------------- |
| 解析与 Chunk（切块）  | 提取正文，按段落/结构拆成适当片段 | 保留退款政策正文及文档 ID，避免把标题和条件切散 |
| Metadata（元数据）    | 保存归属、版本、位置、有效期      | 每块带 owner、documentId、section、version      |
| Embedding（向量表示） | 用模型把文本映射为数值向量        | 查询与文档在兼容空间中可按相似度比较            |
| 关键词检索            | 按字词匹配召回                    | 精确订单号或产品名通常有优势                    |
| 向量检索              | 按向量距离召回相近内容            | 同义表达可能匹配，但相似不等于正确              |
| 混合检索              | 合并不同召回方法的候选            | 综合精确匹配与语义相似                          |
| Reranking（重排序）   | 对已召回候选进一步比较相关性      | 只能重排候选，无法找回完全没被召回的文档        |
| Grounding（依据约束） | 限制回答中的事实来自证据          | 答案带来源，无证据时说明不足                    |

离线索引流程是解析、切块、保存元数据、生成向量和建立索引；在线流程是鉴权、检索、排序、装入上下文、生成与核验。切块大小、重叠量、Top-K 和相似度阈值均应使用真实问题评估，不能照抄固定数字。

## 3. 完整实验：两路召回与排名融合

先预测：其他用户的高相似度资料能否进入候选？对完全未知的问题应该强答吗？保存为 `retrieval.mjs`，运行 `node retrieval.mjs`：

```js
import assert from 'node:assert/strict';
const docs = [
  { id: 'refund', owner: 'u1', text: '退款期限 七天', vector: [1, 0] },
  { id: 'delivery', owner: 'u1', text: '配送 两天', vector: [0, 1] },
  { id: 'private', owner: 'u2', text: '退款 私人协议', vector: [1, 0] },
];

/**
 * 对非零、同维度教学向量计算余弦相似度。
 */
function cosine(a, b) {
  const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
  return dot / (Math.hypot(...a) * Math.hypot(...b));
}

/**
 * 在可见集合内执行关键词和向量召回，再做倒数排名融合。
 */
function retrieve(owner, word, queryVector) {
  const visible = docs.filter((doc) => doc.owner === owner);
  const lexical = visible.filter((doc) => doc.text.includes(word));
  const semantic = visible
    .map((doc) => ({ doc, score: cosine(doc.vector, queryVector) }))
    .filter((row) => row.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.doc);
  const scores = new Map();
  for (const ranking of [lexical, semantic]) {
    ranking.forEach((doc, index) => {
      scores.set(doc.id, (scores.get(doc.id) ?? 0) + 1 / (60 + index + 1));
    });
  }
  return [...scores]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => visible.find((doc) => doc.id === id));
}

const hits = retrieve('u1', '退款', [1, 0]);
assert.deepEqual(
  hits.map((doc) => doc.id),
  ['refund'],
);
assert.equal(hits[0].text, '退款期限 七天');
const missing = retrieve('u1', '保修', [-1, -1]);
assert.equal(missing.length, 0);
const answer = missing.length ? 'use evidence' : 'insufficient_evidence';
assert.equal(answer, 'insufficient_evidence');
console.log('refund [source:refund]; unknown → insufficient_evidence');
```

## 4. 排名结果为什么这样

**余弦相似度**比较向量方向，实验退款向量与查询同方向，因此值为 1；配送与其正交，值为 0。**RRF（倒数排名融合）**按候选在各列表中的名次累加分数，避免直接混加不同量纲的原始分数。这里常数 60 仅用于展示公式，不是通用最佳配置。

refund 同时进入两路列表；private 在检索前就因 owner 不符被剔除；保修查询没有合法匹配，因此触发证据不足。实验中的关键词 includes 和手工向量是机制替身，未实现分词、BM25、真实 Embedding 或学习型重排序。

## 5. 引用、更新与真实接入

把检索结果封装为带 sourceId、版本及片段位置的数据；让模型返回所用 sourceId；应用先确认 ID 确实来自本次可见结果，再检查关键断言是否被片段支持。ID 存在只是第一层检查，不能证明整段答案有依据。

接入真实 Embedding 时，记录模型、维度、预处理和索引版本；切换不兼容模型要重建对应向量，不能混用空间。文档更新或删除时同步索引与缓存；先做访问控制过滤，再把候选发给外部重排序服务。文档内的指令仍视为不可信数据。

## 6. 常见错误与边界

错误做法是“永远取最相近一条并回答”，即使所有分数都低也输出答案。修正是加入无依据策略并评估阈值，必要时追问或说明不知道。相似度分数不是答案正确的概率。

检索质量与生成质量分开评估：正确片段是否被召回、排序是否靠前、最终回答是否受证据支持。RAG 提供信息，不更新模型权重；模型微调更适合稳定行为和格式等需求，二者可按实际问题组合。

## 7. 练习与验收

1. 增加五篇含同义表达和精确型号的资料。验收：分别记录关键词、向量与混合候选差异，不用手工向量的结果声称真实语义效果。
2. 设计 sourceId 校验与断言核验。验收：伪造 ID、存在但无关的 ID 都不会被当成可靠引用。
3. 给资料增加 version 和删除标记。验收：更新或删除后旧版本不会进入本次生成上下文。

## 8. 资料链接

- [Anthropic：上下文检索与按需加载](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OWASP：RAG 的数据来源、索引与检索安全](https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html)
