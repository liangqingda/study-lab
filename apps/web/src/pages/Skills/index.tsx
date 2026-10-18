import { Card, Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconBook,
  IconBrandReact,
  IconCode,
  IconDatabase,
  IconNotebook,
  IconPalette,
  IconRobot,
  IconStack,
} from '@tabler/icons-react';
import { Link } from 'react-router';

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
    path: '/skills/demos/tech-demo',
    title: 'tech-demo',
    icon: <IconStack size={22} />,
    description: '在 study-lab 中编写可运行、可观察的 tech 领域学习 demo 的 agent skill。',
  },
  {
    path: '/skills/demos/create-realm-skill',
    title: 'create-realm-skill',
    icon: <IconRobot size={22} />,
    description: '为新的学习领域（realm）搭建 <realm>-demo skill 的脚手架规范。',
  },
  {
    path: '/skills/demos/frontend-design',
    title: 'frontend-design',
    icon: <IconPalette size={22} />,
    description:
      '构建新 UI 或重塑既有 UI 时提供有辨识度、有意图的视觉设计指导：美学方向、排版、布局与极简设计系统。',
  },
  {
    path: '/skills/demos/best-nodejs-code',
    title: 'best-nodejs-code',
    icon: <IconCode size={22} />,
    description:
      '用 Express 构建生产级 Node.js 后端：中间件模式、错误处理、认证、数据库集成与 API 设计最佳实践。',
  },
  {
    path: '/skills/demos/best-postgres-practices',
    title: 'best-postgres-practices',
    icon: <IconDatabase size={22} />,
    description:
      '面向任意环境的 Postgres 最佳实践：建表/改列、schema 设计、迁移、RLS 策略、索引与慢查询诊断等。',
  },
  {
    path: '/skills/demos/best-react-code',
    title: 'best-react-code',
    icon: <IconBrandReact size={22} />,
    description:
      '客户端 React 性能优化指南：组件、客户端数据拉取、打包优化与客户端渲染应用的性能改进。',
  },
  {
    path: '/skills/demos/take-notes',
    title: 'take-notes',
    icon: <IconNotebook size={22} />,
    description:
      '整理知识点/学习/技术笔记或补充文档某部分；涉及 Notion 时通过 Notion MCP 读写，并自动 review 找知识缺口。',
  },
];

/**
 * Agent Skill 文档总览页（顶层 `/skills`）：列出仓库内各 agent skill 与上游
 * skill 快照，每个 skill 为独立路由，可从侧边栏或卡片进入查看其原文说明。
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
          component={Link}
          key={skill.path}
          padding="lg"
          radius="md"
          shadow="sm"
          to={skill.path}
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
