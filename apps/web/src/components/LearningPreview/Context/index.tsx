import { createContext } from 'react';

/**
 * 弹窗内独立于浏览器地址的学习步骤。
 */
type LearningPreviewState = {
  /** 当前技术分类。 */
  categoryPath: string;
  /** 当前预览阶段的稳定标识。 */
  stepId: string;
  /** 在弹窗内切换步骤。 */
  navigate: (stepId: string) => void;
};

/**
 * 预览内的步骤切换保持在弹窗中，不改变学习路径页面地址。
 */
export const LearningPreviewContext =
  createContext<LearningPreviewState | null>(null);
