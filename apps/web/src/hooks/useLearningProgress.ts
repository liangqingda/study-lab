import { useCallback, useState } from 'react';

const STORAGE_KEY = 'study-lab:learning-progress-v1';

/** 从 localStorage 读取已访问 demo 路径集合；数据损坏时静默回退为空。 */
const loadVisited = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed)
      ? new Set(parsed.filter((item): item is string => typeof item === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
};

const persistVisited = (visited: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  } catch {
    // 本地存储不可用时静默降级：进度只在本次会话内有效。
  }
};

/**
 * 学习进度（基于 localStorage 的 demo 访问标记）。
 *
 * 语义：进入某个 demo 即记为「已学」，供学习路径落地页与 demo 步骤条计算
 * 已完成步数。进度随用户按路径推进自动累积，不依赖后端。
 */
export const useLearningProgress = () => {
  const [visited, setVisited] = useState<Set<string>>(loadVisited);

  const markVisited = useCallback((demoPath: string) => {
    setVisited((previous) => {
      if (previous.has(demoPath)) {
        return previous;
      }

      const next = new Set(previous);

      next.add(demoPath);
      persistVisited(next);

      return next;
    });
  }, []);

  const isVisited = useCallback(
    (demoPath: string) => visited.has(demoPath),
    [visited],
  );

  return { visited, markVisited, isVisited };
};
