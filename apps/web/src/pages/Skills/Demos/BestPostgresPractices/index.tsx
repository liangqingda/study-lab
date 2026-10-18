import { Container } from '@mantine/core';

import bestPostgresPracticesSkill from './SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * best-postgres-practices 上游 skill 文档页（`/skills/demos/best-postgres-practices`）。
 * 内容为仓库内快照，来源 `~/projects/ai-skills/best-postgres-practices`。
 */
const BestPostgresPracticesSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={bestPostgresPracticesSkill} />
  </Container>
);

export default BestPostgresPracticesSkillPage;
