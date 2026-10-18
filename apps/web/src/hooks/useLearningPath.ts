import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router';

import { LearningPreviewContext } from '@/components/LearningPreview/Context/index';
import { learningPaths } from '@/generated/learning-paths';

/**
 * 学习步骤类型：知识阶段（concept）或综合实践（lab）。
 */
export type LearningPathStepKind = 'concept' | 'lab';

/**
 * 独立学习阶段，与 Demo 页面无关联。
 */
export type LearningPathStep = {
  /** 步骤稳定标识，作为完成/熟练度本地存储 key。 */
  id: string;
  /** 步骤序号，从 1 开始。 */
  index: number;
  /** 步骤标题。 */
  title: string;
  /** 步骤一句话说明。 */
  summary: string;
  /** 阶段类型：知识学习或综合实践。 */
  kind: LearningPathStepKind;
  /** 该阶段独立的 Markdown 学习内容。 */
  content: string;
};

/**
 * 某分类（大模块）完整的学习路径信息。
 */
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

/**
 * learning-path.ts 的原始配置形态。
 */
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
    /** 阶段学习内容。 */
    content: string;
    /** 步骤标题。 */
    title: string;
    /** 步骤说明。 */
    summary: string;
  }>;
};

/**
 * 读取当前路由所属分类的学习路径信息。
 *
 * 读取独立编写的学习大纲，每个阶段预览自身的学习内容。
 * Skills 等无学习路径的页面返回 null。
 */
export const useLearningPath = (): LearningPathInfo | null => {
  const location = useLocation();
  const preview = useContext(LearningPreviewContext);
  const pathname = preview?.categoryPath ?? location.pathname;

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
      title: step.title,
      summary: step.summary,
      kind: step.kind ?? 'lab',
      content: step.content,
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
