import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router';

import { LearningPreviewContext } from '@/components/LearningPreview/Context/index';
import { learningPaths } from '@/generated/learning-paths';

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
  /** 预览概念或实验的路由路径，如 `/tech/express/middleware`。 */
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
  /** 模块名称。 */
  label: string;
  /** 模块说明。 */
  description: string;
  /** 有序步骤。 */
  steps: Array<{
    /** 稳定进度标识。 */
    id: string;
    /** 内容类型。 */
    kind?: LearningPathStepKind;
    /** 对应页面目录。 */
    demo?: string;
    /** 步骤标题。 */
    title: string;
    /** 步骤说明。 */
    summary: string;
  }>;
};

/** 与路由段一致的 kebab-case（与 gen-routes 的 toRouteSegment 同规则）。 */
const kebabCase = (value: string) =>
  value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

/**
 * 读取当前路由所属分类的学习路径信息。
 *
 * 读取生成器的统一元数据（包含自动补齐的分类），概念与实验均可预览。
 * Skills 等无学习路径的页面返回 null。
 */
export const useLearningPath = (): LearningPathInfo | null => {
  const location = useLocation();
  const preview = useContext(LearningPreviewContext);
  const pathname = preview?.path ?? location.pathname;

  return useMemo(() => {
    const [realm, category] = pathname.split('/').filter(Boolean);

    if (!realm || !category) {
      return null;
    }

    const categoryPath = `/${realm}/${category}`;
    const config = (learningPaths as Partial<Record<string, RawLearningPath>>)[
      categoryPath
    ];

    if (!config) {
      return null;
    }

    const steps: LearningPathStep[] = config.steps.map((step, index) => ({
      id: step.id,
      index: index + 1,
      /** 步骤标题。 */
      title: step.title,
      /** 步骤说明。 */
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
  }, [pathname]);
};
