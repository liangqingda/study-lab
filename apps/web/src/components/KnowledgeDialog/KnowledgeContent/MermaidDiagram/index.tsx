import { useEffect, useId, useState } from 'react';

import styles from './index.scss';

/**
 * 按需渲染笔记中的流程图与时序图，失败时保留源码供阅读。
 */
const MermaidDiagram = ({ source }: { /** 图示源码。 */ source: string }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
          suppressErrorRendering: true,
        });
        const result = await mermaid.render(`lesson-${id}`, source);

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch {
        // 图示失败不影响笔记与学习进度，继续展示可读的图示源码。
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [id, source]);

  return (
    <figure aria-label="知识点图示" className={styles.diagram}>
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre>{source}</pre>
      )}
      <details>
        <summary>查看图示文字</summary>
        <pre>{source}</pre>
      </details>
    </figure>
  );
};

export default MermaidDiagram;
