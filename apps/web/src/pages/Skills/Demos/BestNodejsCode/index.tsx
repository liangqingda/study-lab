import { Container } from '@mantine/core';

import bestNodejsCodeSkill from './SKILL.md?raw';
import SkillMarkdown from '../../components/SkillMarkdown';

/**
 * best-nodejs-code 上游 skill 文档页（`/skills/demos/best-nodejs-code`）。
 * 内容为仓库内快照，来源 `~/projects/ai-skills/best-nodejs-code`。
 */
const BestNodejsCodeSkillPage = () => (
  <Container py="xl" size="lg">
    <SkillMarkdown content={bestNodejsCodeSkill} />
  </Container>
);

export default BestNodejsCodeSkillPage;
