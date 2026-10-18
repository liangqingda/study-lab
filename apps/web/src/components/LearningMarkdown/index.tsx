import { Children, isValidElement, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { Components } from 'react-markdown';

import { parseHeadings } from '@/components/DemoKnowledgeDialog/utils';

import MermaidDiagram from './MermaidDiagram';

import styles from './index.scss';

/**
 * 识别独立 Mermaid 代码块，其他代码只展示而不执行。
 */
const baseComponents: Components = {
  pre: ({ children }) => {
    const [child] = Children.toArray(children);

    if (
      isValidElement<{ className?: string; children?: string }>(child) &&
      child.props.className === 'language-mermaid'
    ) {
      return (
        <MermaidDiagram source={String(child.props.children ?? '').trim()} />
      );
    }

    return <pre>{children}</pre>;
  },
  table: ({ children }) => (
    <div className={styles.table}>
      <table>{children}</table>
    </div>
  ),
};

/**
 * 详细学习笔记阅读器，提供章节目录、表格滚动及流程/时序图。
 */
const LearningMarkdown = ({
  content,
}: {
  /** 完整笔记正文。 */ content: string;
}) => {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const components = useMemo<Components>(() => {
    const ids = new Map(headings.map((heading) => [heading.line, heading.id]));

    return {
      ...baseComponents,
      h2: ({ node, ...props }) => (
        <h2 id={ids.get(node?.position?.start.line ?? 0)} {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 id={ids.get(node?.position?.start.line ?? 0)} {...props} />
      ),
      h4: ({ node, ...props }) => (
        <h4 id={ids.get(node?.position?.start.line ?? 0)} {...props} />
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          onClick={
            href?.startsWith('#')
              ? (event) => {
                  event.preventDefault();
                  document
                    .getElementById(decodeURIComponent(href.slice(1)))
                    ?.scrollIntoView({ behavior: 'smooth' });
                }
              : undefined
          }
        >
          {children}
        </a>
      ),
    };
  }, [headings]);

  return (
    <>
      <nav aria-label="本篇笔记目录" className={styles.outline}>
        <strong>内容导航</strong>
        <ul>
          {headings
            .filter((heading) => heading.level === 2)
            .map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById(heading.id)
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
        </ul>
      </nav>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </>
  );
};

export default LearningMarkdown;
