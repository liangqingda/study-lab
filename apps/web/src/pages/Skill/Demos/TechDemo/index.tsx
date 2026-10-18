import { Container } from '@mantine/core';

import techDemoSkill from '../../../../../../../.agents/skills/tech-demo/SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * tech-demo skill 文档页（`/skill/demos/tech-demo`）。
 */
const TechDemoSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={techDemoSkill} />
  </Container>
);

export default TechDemoSkillPage;
