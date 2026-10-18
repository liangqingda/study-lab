import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'study-lab:learning-progress-v2';

/** 单个学习步骤的进度：是否主动标记完成 + 熟练度（1-5，数值越大越熟练）。 */
export type StepProgress = {
  /** 用户是否主动点了「标记完成」。 */
  completed?: boolean;
  /** 熟练度等级 1-5（生疏→精通）。 */
  proficiency?: number;
};

/** 进度表：步骤 id → 进度。 */
type ProgressMap = Record<string, StepProgress>;

/** 从 localStorage 读取进度表；数据损坏时静默回退为空。 */
const loadProgress = (): ProgressMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as ProgressMap)
      : {};
  } catch {
    return {};
  }
};

/** 当前页面内共享的进度快照，保证弹窗与总览同步。 */
let snapshot: ProgressMap = loadProgress();

/** 进度变化订阅者。 */
const listeners = new Set<() => void>();

/** 订阅同页操作以及其他标签页的存储变化。 */
const subscribe = (listener: () => void) => {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshot = loadProgress();
      listener();
    }
  };

  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

/** 返回稳定快照供 React 订阅。 */
const getSnapshot = () => snapshot;

/** 发布并持久化新的进度；存储不可用时保留本次会话内的进度。 */
const updateProgress = (update: (previous: ProgressMap) => ProgressMap) => {
  const next = update(snapshot);

  if (next === snapshot) {
    return;
  }

  snapshot = next;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 本地存储不可用时保留内存快照。
  }

  listeners.forEach((listener) => listener());
};

/**
 * 学习进度（基于 localStorage，按步骤 id 记录完成状态与熟练度）。
 *
 * 完成语义：只有用户在落地页或 demo 页主动点「标记完成」才算完成；
 * 进入页面不会自动勾选。熟练度由用户自行标记（1-5 档）。
 */
export const useLearningProgress = () => {
  const progress = useSyncExternalStore(subscribe, getSnapshot);

  const getProgress = useCallback(
    (stepId: string): StepProgress => progress[stepId] ?? {},
    [progress],
  );

  const setCompleted = useCallback((stepId: string, completed: boolean) => {
    updateProgress((previous) => {
      const current = previous[stepId] ?? {};

      if ((current.completed ?? false) === completed) {
        return previous;
      }

      const next = { ...previous, [stepId]: { ...current, completed } };

      return next;
    });
  }, []);

  const setProficiency = useCallback((stepId: string, proficiency: number) => {
    updateProgress((previous) => {
      const current = previous[stepId] ?? {};

      if (current.proficiency === proficiency) {
        return previous;
      }

      const next = {
        ...previous,
        [stepId]: { ...current, proficiency },
      };

      return next;
    });
  }, []);

  const clearProgress = useCallback((stepIds: string[]) => {
    if (stepIds.length === 0) {
      return;
    }

    updateProgress((previous) => {
      const next = { ...previous };

      for (const stepId of stepIds) {
        delete next[stepId];
      }

      if (Object.keys(next).length === Object.keys(previous).length) {
        return previous;
      }

      return next;
    });
  }, []);

  return { progress, getProgress, setCompleted, setProficiency, clearProgress };
};
