/**
 * 题库中可独立检索、展示的一道面试题。
 */
export type InterviewQuestion = {
  /** 题目所在主题。 */
  category: 'general' | 'review';
  /** 包含题目、参考回答、例子和追问的完整 Markdown。 */
  content: string;
};
