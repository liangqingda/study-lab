import { useEffect, useRef, type RefObject } from 'react';

/**
 * 基于滚动位置的阅读位置监听 hook：监听弹窗内容的滚动事件，每次滚动重算当前章节，
 * 回调章节变化。用于目录导航的滚动高亮（scroll-spy）。
 *
 * 当前章节判定：以弹窗顶部及固定头部下方为激活线，
 * 只有标题到达该位置才切换；尚未越线时保持第一节。
 * 激活线不随视口高度按比例移动，避免高屏提前激活下一节。
 *
 * 必须在容器 ref 赋值后（随弹窗内容一起挂载）调用，保证能取到标题。
 */
export const useActiveHeading = (
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  onActiveChange: (id: string) => void,
) => {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const article = containerRef.current;

    if (!article) {
      return;
    }

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>(selector),
    );

    if (headings.length === 0) {
      return;
    }

    const update = () => {
      const scrollport = article.closest('[data-knowledge-scroll]');
      const dialog = article.closest('[role="dialog"]');
      const dialogTop = Math.max(0, dialog?.getBoundingClientRect().top ?? 0);
      const headerBottom =
        dialog?.querySelector('header')?.getBoundingClientRect().bottom ??
        dialogTop;
      const scrollMargin =
        Number.parseFloat(getComputedStyle(headings[0]).scrollMarginTop) || 0;
      // 与章节跳转预留位置一致，容许 1px 的布局取整误差。
      const activationTop = scrollport
        ? scrollport.getBoundingClientRect().top + scrollMargin + 1
        : Math.max(dialogTop + scrollMargin, headerBottom) + 1;
      let current: string | null = null;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= activationTop) {
          current = heading.id;
        } else {
          break; // 标题按文档序排列，后续 top 只会更大。
        }
      }

      // 无标题越过下界（滚动在顶部附近）时回退到第一个标题。
      if (current === null) {
        current = headings[0].id;
      }

      if (current !== lastIdRef.current) {
        lastIdRef.current = current;
        onActiveChange(current);
      }
    };

    let raf = 0;

    // 捕获阶段监听，可收到弹窗内容滚动容器（非视口）的 scroll 事件。
    const onScroll = () => {
      if (raf !== 0) {
        return;
      }

      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    const observer = new ResizeObserver(onScroll);

    observer.observe(article);
    const scrollport = article.closest('[data-knowledge-scroll]');

    if (scrollport) {
      observer.observe(scrollport);
    }

    const header = article.closest('[role="dialog"]')?.querySelector('header');

    if (header) {
      observer.observe(header);
    }

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();

      if (raf !== 0) {
        cancelAnimationFrame(raf);
      }
    };
  }, [containerRef, selector, onActiveChange]);
};
