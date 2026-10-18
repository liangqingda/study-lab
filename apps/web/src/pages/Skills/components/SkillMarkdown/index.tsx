import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './index.scss';

type SkillMarkdownProps = {
  /** skill 文档原文（可为带 frontmatter 的 Markdown）。 */
  content: string;
};

/**
 * 去除 Markdown 开头的 YAML frontmatter（`---` 包裹的键值块），
 * 只保留正文，避免 react-markdown 把 frontmatter 当普通文本渲染。
 */
const stripFrontmatter = (source: string): string =>
  source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

/**
 * 渲染一份 skill 的 Markdown 文档正文，应用统一的 markdown 排版样式。
 */
const SkillMarkdown = ({ content }: SkillMarkdownProps) => (
  <article className={styles.markdown}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {stripFrontmatter(content)}
    </ReactMarkdown>
  </article>
);

export default SkillMarkdown;
