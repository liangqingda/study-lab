import { useEffect } from 'react';
import { Badge, Button, Group, Text } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router';

import { useLearningPath } from '@/hooks/useLearningPath';
import { useLearningProgress } from '@/hooks/useLearningProgress';

import styles from './index.scss';

/**
 * demo 页顶部的学习路径步骤条（由 DemoLayout 内嵌，所有 demo 自动生效）。
 *
 * 显示「本模块第 N/M 步」与已完成进度，提供上一/下一模块导航；
 * 进入某个 demo 即把该步骤标记为已学。仅当所在模块配置了 learning-path.ts
 * 且步骤数 ≥ 2 时展示。
 */
const LearningPathSteps = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const info = useLearningPath();
  const { markVisited, isVisited } = useLearningProgress();

  useEffect(() => {
    if (!info) {
      return;
    }

    const current = info.steps.find(
      (step) => step.demoPath === location.pathname,
    );

    if (current) {
      markVisited(current.demoPath);
    }
  }, [info, location.pathname, markVisited]);

  if (!info || info.total < 2) {
    return null;
  }

  const currentIndex = info.steps.findIndex(
    (step) => step.demoPath === location.pathname,
  );

  if (currentIndex === -1) {
    return null;
  }

  const previous = currentIndex > 0 ? info.steps[currentIndex - 1] : null;
  const next =
    currentIndex < info.total - 1 ? info.steps[currentIndex + 1] : null;
  const doneCount = info.steps.filter((step) => isVisited(step.demoPath)).length;

  const goTo = (demoPath: string) => {
    markVisited(demoPath);
    navigate(demoPath);
  };

  return (
    <div className={styles.bar}>
      <Group gap="sm" wrap="nowrap">
        <Badge color="teal" size="sm" variant="light">
          第 {currentIndex + 1} / {info.total} 步
        </Badge>
        <Text c="dimmed" size="sm">
          {info.label} · 已完成 {doneCount}/{info.total}
        </Text>
      </Group>
      <Group gap="xs" wrap="nowrap">
        {previous ? (
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => goTo(previous.demoPath)}
            size="xs"
            variant="subtle"
          >
            上一模块
          </Button>
        ) : null}
        {next ? (
          <Button
            onClick={() => goTo(next.demoPath)}
            rightSection={<IconArrowRight size={14} />}
            size="xs"
            variant="light"
          >
            下一模块
          </Button>
        ) : null}
      </Group>
    </div>
  );
};

export default LearningPathSteps;
