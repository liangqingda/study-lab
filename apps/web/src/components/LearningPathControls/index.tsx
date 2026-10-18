import { Badge, Button, Group, Rating, Text } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router';
import { useContext } from 'react';

import { LearningPreviewContext } from '@/components/LearningPreview/Context';
import { useLearningPath } from '@/hooks/useLearningPath';
import { useLearningProgress } from '@/hooks/useLearningProgress';

import styles from './index.scss';

/** 熟练度 1-5 档的展示文案（下标 0 对应 1 星）。 */
const PROFICIENCY_LABELS = ['生疏', '了解', '熟悉', '熟练', '精通'];

/**
 * 概念页与 demo 页正文底部的学习路径控件，由共用布局内嵌。
 *
 * 显示「本模块第 N/M 步」与已完成进度，提供上一/下一步导航，并对当前
 * 步骤提供「标记完成」与熟练度标记。完成只由用户主动点击触发，进入页面
 * 不会自动勾选。
 */
const LearningPathControls = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preview = useContext(LearningPreviewContext);
  const info = useLearningPath();
  const { getProgress, setCompleted, setProficiency } = useLearningProgress();

  if (!info || info.total === 0) {
    return null;
  }

  const currentIndex = info.steps.findIndex(
    (step) => step.demoPath === (preview?.path ?? location.pathname),
  );

  // 当前页面不属于该模块路径上的 lab 步骤（如模块外的页面）时不展示。
  if (currentIndex === -1) {
    return null;
  }

  const current = info.steps[currentIndex];
  const currentProgress = getProgress(current.id);
  const completed = Boolean(currentProgress.completed);
  // 每一步都有对应页面，上/下导航直接跳相邻步骤。
  const hasPrevious = currentIndex > 0;
  const previous = info.steps[currentIndex - 1];
  const hasNext = currentIndex < info.total - 1;
  const next = info.steps[currentIndex + 1];
  const doneCount = info.steps.filter(
    (step) => getProgress(step.id).completed,
  ).length;

  const goTo = (demoPath?: string) => {
    if (demoPath) {
      (preview?.navigate ?? navigate)(demoPath);
    }
  };

  return (
    <div className={styles.bar}>
      <Group className={styles.meta} gap="sm" wrap="nowrap">
        <Badge color="teal" size="sm" variant="light">
          第 {currentIndex + 1} / {info.total} 步
        </Badge>
        <Text c="dimmed" size="sm">
          {info.label} · 已完成 {doneCount}/{info.total}
        </Text>
      </Group>

      <Group className={styles.proficiency} gap="xs" wrap="nowrap">
        <Rating
          aria-label="标记熟练度"
          onChange={(value) => setProficiency(current.id, value)}
          size="xs"
          value={currentProgress.proficiency ?? 0}
        />
        <Text c="dimmed" size="sm">
          {currentProgress.proficiency
            ? PROFICIENCY_LABELS[currentProgress.proficiency - 1]
            : '未标记熟练度'}
        </Text>
      </Group>

      <Group className={styles.actions} gap="xs" wrap="nowrap">
        {hasPrevious ? (
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => goTo(previous.demoPath)}
            size="xs"
            variant="subtle"
          >
            上一步
          </Button>
        ) : null}
        {hasNext ? (
          <Button
            onClick={() => goTo(next.demoPath)}
            rightSection={<IconArrowRight size={14} />}
            size="xs"
            variant="subtle"
          >
            下一步
          </Button>
        ) : null}
        <Button
          color={completed ? 'gray' : 'green'}
          leftSection={completed ? <IconCheck size={14} /> : undefined}
          onClick={() => setCompleted(current.id, !completed)}
          size="xs"
          variant={completed ? 'subtle' : 'filled'}
        >
          {completed ? '已完成' : '标记完成'}
        </Button>
      </Group>
    </div>
  );
};

export default LearningPathControls;
