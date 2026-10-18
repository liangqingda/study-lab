import type { LearningPathInfo } from '@/hooks/useLearningPath';
import KnowledgeDialog from '@/components/KnowledgeDialog';
import LearningPathControls from '@/components/LearningPathControls';

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

  return step ? (
    <LearningPreviewContext
      value={{
        categoryPath: info.categoryPath,
        stepId: step.id,
        navigate: onChange,
      }}
    >
      <KnowledgeDialog
        content={step.content}
        footer={<LearningPathControls />}
        onClose={onClose}
        opened
        subtitle={`${info.label} · 学习路径`}
        title={step.title}
      />
    </LearningPreviewContext>
  ) : null;
};

export default LearningPreview;
