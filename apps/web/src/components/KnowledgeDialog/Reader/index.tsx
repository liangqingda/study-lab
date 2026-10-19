import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text } from '@mantine/core';

import type { KnowledgeReaderProps } from '../types';

import KnowledgeContent from '../KnowledgeContent';
import TocTree from '../TocTree';
import { buildTree, collectAncestors, parseHeadings } from '../utils';

import styles from '../index.scss';

/**
 * 两种知识阅读入口共用的目录、滚动高亮与 Markdown 正文。
 * 内容变更时由父组件重新挂载，重置目录折叠、高亮和阅读位置。
 */
const KnowledgeReader = ({
  content,
  footer,
  contained = false,
}: KnowledgeReaderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const sidebarRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toc = useMemo(() => parseHeadings(content), [content]);
  const tocTree = useMemo(() => buildTree(toc), [toc]);
  const currentActive = activeId ?? (toc.length > 0 ? toc[0].id : null);

  /*
   * 章节变化（点击跳转或滚动高亮）时，记录当前章并自动展开其祖先链，
   * 保证高亮项在折叠的子树里也能露出，行为与飞书/Notion 一致。
   */
  const handleActiveChange = useCallback(
    (id: string) => {
      setActiveId(id);

      const ancestors = collectAncestors(tocTree, id) ?? [];

      if (ancestors.length === 0) {
        return;
      }

      setCollapsed((prev) => {
        const next = new Set(prev);
        let changed = false;

        for (const ancestorId of ancestors) {
          if (next.delete(ancestorId)) {
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    },
    [tocTree],
  );

  /* 阅读位置变化时，让目录随动，保证高亮项始终在左侧可视范围内。 */
  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar || !currentActive) {
      return;
    }

    const item = sidebar.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(currentActive)}"]`,
    );

    if (!item) {
      return;
    }

    const row = item.firstElementChild ?? item;
    const top =
      row.getBoundingClientRect().top -
      sidebar.getBoundingClientRect().top +
      sidebar.scrollTop;
    const bottom = top + row.getBoundingClientRect().height;

    if (top < sidebar.scrollTop) {
      sidebar.scrollTop = Math.max(0, top - 8);
    } else if (bottom > sidebar.scrollTop + sidebar.clientHeight) {
      sidebar.scrollTop = bottom - sidebar.clientHeight + 8;
    }
  }, [currentActive]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);

    if (target) {
      const scrollport = contained ? contentRef.current : null;
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
        ? 'instant'
        : 'smooth';

      if (scrollport) {
        const margin =
          Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;

        scrollport.scrollTo({
          top:
            scrollport.scrollTop +
            target.getBoundingClientRect().top -
            scrollport.getBoundingClientRect().top -
            margin,
          behavior,
        });
      } else {
        target.scrollIntoView({ behavior, block: 'start' });
      }

      handleActiveChange(id);
    }
  };

  /* 切换某个目录节点的展开/收起。 */
  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const layoutRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    layoutRef.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 });
  }, []);

  return (
    <div
      className={`${styles.knowledgeLayout} ${contained ? styles.contained : ''}`}
      ref={layoutRef}
    >
      <aside className={styles.sidebar}>
        <nav
          aria-label="知识点目录"
          className={styles.sidebarBody}
          ref={sidebarRef}
        >
          {toc.length === 0 ? (
            <Text c="dimmed" size="sm">
              本节暂无标题目录。
            </Text>
          ) : (
            <TocTree
              activeId={currentActive}
              collapsed={collapsed}
              depth={0}
              nodes={tocTree}
              onJump={scrollToSection}
              onToggle={toggleCollapsed}
            />
          )}
        </nav>
      </aside>
      <div
        aria-label={contained ? '知识点正文' : undefined}
        className={styles.content}
        data-knowledge-scroll={contained || undefined}
        ref={contentRef}
        role={contained ? 'region' : undefined}
        tabIndex={contained ? 0 : undefined}
      >
        <KnowledgeContent
          content={content}
          footer={footer}
          onActiveChange={handleActiveChange}
          toc={toc}
        />
      </div>
    </div>
  );
};

export default KnowledgeReader;
