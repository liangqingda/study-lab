import general from './notes/general.md?raw';
import review from './notes/review.md?raw';
import { parseQuestions } from './utils';

/**
 * 题库主题及其阅读标题。
 */
export const QUESTION_CATEGORIES = [
  { value: 'general', label: '通用 AI 使用' },
  { value: 'review', label: 'PR Review 专题' },
] as const;

/**
 * 两轮讨论中的全部问题：通用题 16 道，PR Review 题 18 道。
 */
export const QUESTIONS = [
  ...parseQuestions(general, 'general'),
  ...parseQuestions(review, 'review'),
];

/**
 * 题库的阅读说明、术语与答题方法。
 */
export const INTRODUCTION = `## 阅读与答题方法

这里收录 16 道通用 AI 使用题和 18 道 PR Review 专题题。先独立回答，再对照参考答案；答案是一种工程思路，具体门槛要结合业务风险、数据和团队流程决定。案例均为教学假设，不代表已发生的项目结果，也不代表已经运行过的 AI 实验。

回答时按「场景与目标 → 输入与约束 → 执行方法 → 验证证据 → 失败与取舍」展开。经历题请用自己的真实项目替换例子，说明自己做了哪些判断。

- **上下文**：模型处理任务时能看到的信息，例如需求、类型定义、日志与项目约定；缺少调用方可能使局部正确的修改破坏外部行为。
- **幻觉**：输出看似合理、实际缺少依据或错误的内容，例如编造一个不存在的 API；表达流畅不能证明正确。
- **评测集**：按统一标准判断系统表现的一组案例；开发用例用于调试，保留测试集用于检验改进是否能推广。
- **RAG（检索增强生成）**：先从资料中找证据再组织答案，例如先检索现行报销规则再回答；找到相似段落不等于答案正确。
- **Agent**：由模型参与决定下一步、调用工具并根据结果继续执行的系统；能调用工具不代表它拥有任意执行权限。
- **提示词注入**：资料中的恶意文字试图改变助手的任务或权限，例如网页要求上传密钥；资料应被当成数据，权限由程序强制约束。

参考方法：[提示设计前先明确成功标准](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)。
`;

/**
 * 练习与来源，随筛选结果一起保留，便于对照验证。
 */
export const PRACTICE = `## 练习与验收

1. **需求实现**：选择自己项目中的一个小需求，先写 3 条验收标准再使用 AI。验收：提交输入、最终差异、正常与异常用例结果，并说明一次人工纠正。
2. **答案核验**：选一道内部资料问答，加入一份过期文档和一个无权限来源。先预测它应该回答什么，再检查结果。验收：答案引用有效且可访问的证据；证据不足明确说明，不凭空补全。
3. **Review 评测**：准备 5 个含已知缺陷的变更和 5 个正常变更。验收：标注真实问题与重复项，按统一规则计算精确率和召回率，单独列出漏报；小样本只用于练习，不能宣称具有生产质量。

## 资料链接

以下资料用于核对方法与边界，不是本题库的标准答案。资料核对日期：2026-10-19；页面不绑定某个模型版本，也不假设某家产品支持特定权限或自动化能力。

- [Claude：定义成功标准与构建评测](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [Claude：提示设计概览](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [GitHub：AI 代码审查](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/code-review)
- [OWASP：提示词注入防护](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
`;
