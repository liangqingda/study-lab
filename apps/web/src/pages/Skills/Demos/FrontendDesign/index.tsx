import { Container } from '@mantine/core';

import frontendDesignSkill from './SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * frontend-design 上游 skill 文档页（`/skills/demos/frontend-design`）。
 * 内容为仓库内快照，来源 `~/projects/ai-skills/frontend-design`。
 */
const FrontendDesignSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={frontendDesignSkill} />
  </Container>
);

export default FrontendDesignSkillPage;
