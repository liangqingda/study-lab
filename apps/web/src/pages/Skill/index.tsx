import { Card, Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBook, IconRobot, IconStack } from '@tabler/icons-react';

import type { ReactNode } from 'react';

import styles from './index.scss';

type SkillLink = {
  path: string;
  title: string;
  icon: ReactNode;
  description: string;
};

const SKILLS: SkillLink[] = [
  {
    path: '/skill/demos/tech-demo',
    title: 'tech-demo',
    icon: <IconStack size={22} />,
    description: '在 study-lab 中编写可运行、可观察的 tech 领域学习 demo 的 agent skill。',
  },
  {
    path: '/skill/demos/create-realm-skill',
    title: 'create-realm-skill',
    icon: <IconRobot size={22} />,
    description: '为新的学习领域（realm）搭建 <realm>-demo skill 的脚手架规范。',
  },
];

/**
 * Agent Skill 文档总览页（顶层 `/skill`）：列出仓库内的各 agent skill，
 * 每个 skill 为独立路由，可从侧边栏或卡片进入查看其原文说明。
 */
const SkillDocs = () => (
  <Container py="xl" size="lg">
    <ThemeIcon className={styles.skillHeroIcon} color="teal" radius="md" size={44}>
      <IconBook size={24} />
    </ThemeIcon>
    <Title mb={4} order={1}>
      Agent Skill 文档
    </Title>
    <Text c="dimmed" mb="xl">
      study-lab 仓库内用于编写学习型 demo 的 agent skill 说明。这些 skill 由 AI
      在仓库中新增/修改 demo 时读取执行，此处原文展示其规则与约定。
    </Text>

    <SimpleGrid className={styles.skillGrid} cols={{ base: 1, sm: 2 }}>
      {SKILLS.map((skill) => (
        <Card
          className={styles.skillCard}
          component="a"
          href={skill.path}
          key={skill.path}
          padding="lg"
          radius="md"
          shadow="sm"
          withBorder
        >
          <ThemeIcon color="teal" radius="md" size={36} variant="light">
            {skill.icon}
          </ThemeIcon>
          <Title className={styles.skillCardTitle} mt="sm" order={3}>
            {skill.title}
          </Title>
          <Text c="dimmed" size="sm">
            {skill.description}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  </Container>
);

export default SkillDocs;
