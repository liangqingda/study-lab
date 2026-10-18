import { useMemo } from 'react';
import { useLocation } from 'react-router';

/** 学习步骤类型：概念/讲解（concept）或 动手实验（lab）。 */
export type LearningPathStepKind = 'concept' | 'lab';

/** 单个学习步骤：learning-path 配置的元信息 + 可导航的 demo 路由（可选）。 */
export type LearningPathStep = {
  /** 步骤稳定标识，作为完成/熟练度本地存储 key。 */
  id: string;
  /** 步骤序号，从 1 开始。 */
  index: number;
  /** 步骤标题。 */
  title: string;
  /** 步骤一句话说明。 */
  summary: string;
  /** 步骤类型：概念讲解或动手实验。 */
  kind: LearningPathStepKind;
  /** 关联 demo 的路由路径（仅 lab 步骤），如 `/tech/express/middleware`。 */
  demoPath?: string;
};

/** 某分类（大模块）完整的学习路径信息。 */
export type LearningPathInfo = {
  /** 领域路由前缀，如 `/tech`。 */
  realmPath: string;
  /** 分类路由前缀，如 `/tech/express`。 */
  categoryPath: string;
  /** 模块展示名。 */
  label: string;
  /** 模块整体说明。 */
  description: string;
  /** 推荐学习步骤（有序）。 */
  steps: LearningPathStep[];
  /** 步骤总数。 */
  total: number;
};

/** learning-path.ts 的原始配置形态。 */
type RawLearningPath = {
  label: string;
  description: string;
  steps: Array<{
    id: string;
    kind?: LearningPathStepKind;
    demo?: string;
    title: string;
    summary: string;
  }>;
};

/**
 * 运行时装在所有分类下的 `learning-path.ts` 配置。
 * key 形如 `/src/pages/Tech/Express/learning-path.ts`；eager 使模块同步可用。
 * 注意：这里刻意不 import `generated/routes`，避免 demo 页面 → 布局 → 本 hook →
 * 路由表（其 lazy 引用了所有 demo 页）构成依赖环。
 */
const learningPathModules = import.meta.glob('@/pages/*/*/learning-path.ts', {
  eager: true,
});

/** 与路由段一致的 kebab-case（与 gen-routes 的 toRouteSegment 同规则）。 */
const kebabCase = (value: string) =>
  value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

/** 从 glob key 解析出分类目录名并转成路由前缀。 */
const resolveCategoryFromKey = (
  key: string,
): { realmPath: string; categoryPath: string } | null => {
  const match = /\/pages\/([^/]+)\/([^/]+)\/learning-path\.ts$/.exec(key);

  return match
    ? {
        realmPath: `/${kebabCase(match[1])}`,
        categoryPath: `/${kebabCase(match[1])}/${kebabCase(match[2])}`,
      }
    : null;
};

/**
 * 读取当前路由所属分类的学习路径信息。
 *
 * - 分类目录下没有 `learning-path.ts`、或路径不在已配置分类内时返回 null；
 * - `steps` 顺序沿用配置；`lab` 步骤带 `demo` 时推导出 `demoPath`，
 *   纯概念步骤不关联 demo。
 */
export const useLearningPath = (): LearningPathInfo | null => {
  const location = useLocation();

  return useMemo(() => {
    const [realm, category] = location.pathname.split('/').filter(Boolean);

    if (!realm || !category) {
      return null;
    }

    const categoryPath = `/${realm}/${category}`;
    const entry = Object.entries(learningPathModules).find(([key]) => {
      const resolved = resolveCategoryFromKey(key);

      return resolved?.categoryPath === categoryPath;
    });

    if (!entry) {
      return null;
    }

    const config = (entry[1] as { learningPath: RawLearningPath }).learningPath;
    const steps: LearningPathStep[] = config.steps.map((step, index) => ({
      id: step.id,
      index: index + 1,
      title: step.title,
      summary: step.summary,
      kind: step.kind ?? 'lab',
      ...(step.demo
        ? { demoPath: `${categoryPath}/${kebabCase(step.demo)}` }
        : {}),
    }));

    if (steps.length === 0) {
      return null;
    }

    return {
      realmPath: `/${realm}`,
      categoryPath,
      label: config.label,
      description: config.description,
      steps,
      total: steps.length,
    };
  }, [location.pathname]);
};
