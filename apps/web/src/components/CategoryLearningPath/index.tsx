import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Rating,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowRight,
  IconCheck,
  IconCircle,
  IconRotate,
} from '@tabler/icons-react';
import { useState } from 'react';

import LearningPreview from '@/components/LearningPreview';
import { useLearningPath } from '@/hooks/useLearningPath';
import { useLearningProgress } from '@/hooks/useLearningProgress';

import styles from './index.scss';

/** 熟练度 1-5 档的展示文案（下标 0 对应 1 星）。 */
const PROFICIENCY_LABELS = ['生疏', '了解', '熟悉', '熟练', '精通'];

/**
 * 分类的「学习路径」总览，由 gen-routes 为非 Skills 分类统一生成。
 * 开始学习在弹窗内预览，保持总览页面与进度。
 *
 * 展示设计的教学路径（概念/实验步骤）；每步可主动「标记完成」并标记熟练度，
 * 均基于 localStorage 持久化。完成与熟练度不随进入页面自动勾选。
 */
const CategoryLearningPath = () => {
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const info = useLearningPath();
  const { getProgress, setCompleted, setProficiency, clearProgress } =
    useLearningProgress();

  if (!info) {
    return (
      <div className={styles.shell}>
        <div className={styles.empty}>
          <Text c="dimmed">该模块还没有配置学习路径。</Text>
        </div>
      </div>
    );
  }

  const doneCount = info.steps.filter(
    (step) => getProgress(step.id).completed,
  ).length;
  const progress = Math.round((doneCount / info.total) * 100);
  const hasAnyProgress = info.steps.some((step) => {
    const current = getProgress(step.id);

    return Boolean(current.completed) || Boolean(current.proficiency);
  });

  const enter = (demoPath?: string) => {
    if (demoPath) {
      setPreviewPath(demoPath);
    }
  };

  const resetProgress = () => {
    clearProgress(info.steps.map((step) => step.id));
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <Title order={1}>{info.label} 学习路径</Title>
          <Text c="dimmed">{info.description}</Text>
        </div>
        <div className={styles.progressBlock}>
          <Text className={styles.progressText} size="sm">
            已完成 {doneCount} / {info.total}
          </Text>
          <Progress
            aria-label={`已完成 ${progress}%`}
            className={styles.progressBar}
            color="teal"
            size="md"
            value={progress}
          />
          <Button
            className={styles.resetButton}
            disabled={!hasAnyProgress}
            leftSection={<IconRotate size={14} />}
            onClick={resetProgress}
            size="xs"
            variant="subtle"
          >
            重置进度
          </Button>
        </div>
      </header>

      <LearningPreview
        key={info.categoryPath}
        onChange={setPreviewPath}
        onClose={() => setPreviewPath(null)}
        path={
          previewPath?.startsWith(`${info.categoryPath}/`) ? previewPath : null
        }
      />
      <ol className={styles.timeline}>
        {info.steps.map((step) => {
          const current = getProgress(step.id);
          const completed = Boolean(current.completed);

          return (
            <li key={step.id}>
              <Card
                className={styles.stepCard}
                padding="lg"
                radius="md"
                shadow="none"
                withBorder
              >
                <Group align="flex-start" justify="space-between" wrap="nowrap">
                  <Group align="flex-start" gap="md" wrap="nowrap">
                    <span
                      aria-hidden="true"
                      className={completed ? styles.markerDone : styles.marker}
                    >
                      {completed ? (
                        <IconCheck size={18} stroke={2.4} />
                      ) : (
                        <IconCircle size={18} stroke={1.8} />
                      )}
                    </span>
                    <div className={styles.stepBody}>
                      <Group gap="sm" wrap="nowrap">
                        <Badge
                          color={step.kind === 'lab' ? 'teal' : 'gray'}
                          size="sm"
                          variant="light"
                        >
                          {step.kind === 'lab' ? '实验' : '概念'}
                        </Badge>
                        <Text
                          className={styles.stepIndex}
                          component="span"
                          size="sm"
                        >
                          第 {step.index} 步
                        </Text>
                        {completed ? (
                          <Badge color="green" size="sm" variant="filled">
                            已完成
                          </Badge>
                        ) : null}
                      </Group>
                      <Title className={styles.stepTitle} order={3}>
                        {step.title}
                      </Title>
                      <Text className={styles.stepSummary} size="sm">
                        {step.summary}
                      </Text>
                      <Group
                        className={styles.proficiency}
                        gap="xs"
                        wrap="nowrap"
                      >
                        <Rating
                          aria-label="标记熟练度"
                          onChange={(value) => setProficiency(step.id, value)}
                          size="sm"
                          value={current.proficiency ?? 0}
                        />
                        <Text c="dimmed" size="sm">
                          {current.proficiency
                            ? PROFICIENCY_LABELS[current.proficiency - 1]
                            : '未标记熟练度'}
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  <Group className={styles.actions} gap="xs" wrap="nowrap">
                    {step.demoPath ? (
                      <Button
                        leftSection={<IconArrowRight size={16} />}
                        onClick={() => enter(step.demoPath)}
                        size="xs"
                        variant="light"
                      >
                        开始学习
                      </Button>
                    ) : null}
                    <Button
                      color={completed ? 'gray' : 'green'}
                      onClick={() => setCompleted(step.id, !completed)}
                      size="xs"
                      variant={completed ? 'subtle' : 'filled'}
                    >
                      {completed ? '取消完成' : '标记完成'}
                    </Button>
                  </Group>
                </Group>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default CategoryLearningPath;
