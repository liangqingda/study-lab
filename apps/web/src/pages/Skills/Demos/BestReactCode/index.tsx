import { Container } from '@mantine/core';

import bestReactCodeSkill from './SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * best-react-code 上游 skill 文档页（`/skills/demos/best-react-code`）。
 * 内容为仓库内快照，来源 `~/projects/ai-skills/best-react-code`。
 */
const BestReactCodeSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={bestReactCodeSkill} />
  </Container>
);

export default BestReactCodeSkillPage;
