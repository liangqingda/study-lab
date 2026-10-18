import { Badge, Button, Card, Group, Progress, Text, Title } from '@mantine/core';
import { IconArrowRight, IconCheck, IconCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { useLearningPath } from '@/hooks/useLearningPath';
import { useLearningProgress } from '@/hooks/useLearningProgress';

import styles from './index.scss';

/**
 * 分类（大模块）的「学习路径」落地页，由 gen-routes 为带 learning-path.ts
 * 的分类自动生成路由（/realm/分类）并复用本组件渲染。
 *
 * 展示该模块的推荐学习顺序与进度（基于 localStorage 的已学标记），
 * 点击步骤进入对应 demo。
 */
const CategoryLearningPath = () => {
  const navigate = useNavigate();
  const info = useLearningPath();
  const { markVisited, isVisited } = useLearningProgress();

  if (!info) {
    return (
      <div className={styles.shell}>
        <div className={styles.empty}>
          <Text c="dimmed">该模块还没有配置学习路径。</Text>
        </div>
      </div>
    );
  }

  const doneCount = info.steps.filter((step) => isVisited(step.demoPath)).length;
  const progress = Math.round((doneCount / info.total) * 100);

  const enter = (demoPath: string) => {
    markVisited(demoPath);
    navigate(demoPath);
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
        </div>
      </header>

      <ol className={styles.timeline}>
        {info.steps.map((step) => {
          const done = isVisited(step.demoPath);

          return (
            <li key={step.demoPath}>
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
                      className={done ? styles.markerDone : styles.marker}
                    >
                      {done ? (
                        <IconCheck size={18} stroke={2.4} />
                      ) : (
                        <IconCircle size={18} stroke={1.8} />
                      )}
                    </span>
                    <div className={styles.stepBody}>
                      <Group gap="sm" wrap="nowrap">
                        <Text className={styles.stepIndex} component="span" size="sm">
                          第 {step.index} 步
                        </Text>
                        {done ? (
                          <Badge color="teal" size="sm" variant="light">
                            已学
                          </Badge>
                        ) : null}
                      </Group>
                      <Title className={styles.stepTitle} order={3}>
                        {step.title}
                      </Title>
                      <Text className={styles.stepSummary} size="sm">
                        {step.summary}
                      </Text>
                    </div>
                  </Group>
                  <Button
                    className={styles.enterButton}
                    onClick={() => enter(step.demoPath)}
                    rightSection={<IconArrowRight size={16} />}
                    size="xs"
                    variant={done ? 'subtle' : 'light'}
                  >
                    开始学习
                  </Button>
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
