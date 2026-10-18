import { Container } from '@mantine/core';

import createRealmSkill from '../../../../../../../.agents/skills/create-realm-skill/SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * create-realm-skill 文档页（`/skills/demos/create-realm-skill`）。
 */
const CreateRealmSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={createRealmSkill} />
  </Container>
);

export default CreateRealmSkillPage;
