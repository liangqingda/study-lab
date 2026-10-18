import { Container } from '@mantine/core';

import takeNotesSkill from './SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * take-notes 上游 skill 文档页（`/skills/demos/take-notes`）。
 * 内容为仓库内快照，来源 `~/projects/ai-skills/take-notes`。
 */
const TakeNotesSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={takeNotesSkill} />
  </Container>
);

export default TakeNotesSkillPage;
