import { Modal } from '@mantine/core';

import type { LearningPathInfo } from '@/hooks/useLearningPath';
import ConceptPageLayout from '@/components/ConceptPageLayout';
import LearningMarkdown from '@/components/LearningMarkdown';

import { LearningPreviewContext } from './Context/index';

/**
 * 学习阶段弹窗的受控状态，使用阶段 id 而非 Demo 路由。
 */
type LearningPreviewProps = {
  /** 独立编写的技术学习大纲。 */
  info: LearningPathInfo;
  /** 当前预览阶段，null 表示关闭。 */
  stepId: string | null;
  /** 在弹窗内切换阶段。 */
  onChange: (stepId: string) => void;
  /** 关闭预览。 */
  onClose: () => void;
};

/**
 * 展示阶段目标、知识范围、练习及验收标准，不加载任何 Demo 页面。
 */
const LearningPreview = ({
  info,
  stepId,
  onChange,
  onClose,
}: LearningPreviewProps) => {
  const step = info.steps.find((item) => item.id === stepId);

  return (
    <Modal
      fullScreen
      onClose={onClose}
      opened={Boolean(step)}
      title={`${info.label} · 学习路径`}
    >
      {step ? (
        <LearningPreviewContext
          value={{
            categoryPath: info.categoryPath,
            stepId: step.id,
            navigate: onChange,
          }}
        >
          <ConceptPageLayout
            description={step.summary}
            key={step.id}
            title={step.title}
          >
            <LearningMarkdown content={step.content} />
          </ConceptPageLayout>
        </LearningPreviewContext>
      ) : null}
    </Modal>
  );
};

export default LearningPreview;
