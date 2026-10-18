import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Container, Text, Title } from '@mantine/core';

import createRealmSkill from '../../../../../.agents/skills/create-realm-skill/SKILL.md?raw';
import techDemoSkill from '../../../../../.agents/skills/tech-demo/SKILL.md?raw';

import styles from './index.scss';

/**
 * 去除 Markdown 开头的 YAML frontmatter（`---` 包裹的键值块），
 * 只保留正文，避免 react-markdown 把 frontmatter 当普通文本渲染。
 */
const stripFrontmatter = (source: string): string =>
  source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

const TechDemoContent = stripFrontmatter(techDemoSkill);
const CreateRealmSkillContent = stripFrontmatter(createRealmSkill);

/**
 * Agent Skill 文档页（顶层 `/skill`）：展示 study-lab 仓库内编写学习型
 * demo 所用的 agent skill 说明，供在学习路径外快速查阅 skill 约定。
 */
const SkillDocs = () => (
  <Container py="xl" size="lg">
    <Title mb={4} order={1}>
      Agent Skill 文档
    </Title>
    <Text c="dimmed" mb="lg">
      study-lab 仓库内用于编写学习型 demo 的 agent skill 说明。这些 skill 由 AI
      在仓库中新增/修改 demo 时读取执行，此处原文展示其规则与约定。
    </Text>

    <div className={styles.skillNav}>
      <a className={styles.skillNavLink} href="#tech-demo">
        tech-demo
      </a>
      <a className={styles.skillNavLink} href="#create-realm-skill">
        create-realm-skill
      </a>
    </div>

    <Box mb="xl">
      <Title id="tech-demo" mb="sm" order={2}>
        tech-demo
      </Title>
      <div className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {TechDemoContent}
        </ReactMarkdown>
      </div>
    </Box>

    <Box>
      <Title id="create-realm-skill" mb="sm" order={2}>
        create-realm-skill
      </Title>
      <div className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {CreateRealmSkillContent}
        </ReactMarkdown>
      </div>
    </Box>
  </Container>
);

export default SkillDocs;
