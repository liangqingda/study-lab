import type { InterviewQuestion } from './types';

/**
 * 按三级标题读取题目，保留原始编号与完整答案。
 */
export const parseQuestions = (
  markdown: string,
  category: InterviewQuestion['category'],
): InterviewQuestion[] =>
  markdown
    .split(/(?=^### )/m)
    .map((content) => content.trim())
    .filter((content) => content.startsWith('### '))
    .map((content) => ({ category, content }));
