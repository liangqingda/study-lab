import { createContext } from 'react';

/**
 * 弹窗内独立于浏览器地址的学习步骤。
 */
type LearningPreviewState = {
  /** 当前预览步骤路径。 */
  path: string;
  /** 在弹窗内切换步骤。 */
  navigate: (path: string) => void;
};

/**
 * 预览内的步骤切换保持在弹窗中，不改变学习路径页面地址。
 */
export const LearningPreviewContext =
  createContext<LearningPreviewState | null>(null);
