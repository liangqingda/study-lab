import { useLayoutEffect, useRef } from 'react';

/**
 * 根据页面的实际顶部位置扣除全局导航高度，保持阅读区域位于当前视口内。
 */
export const useReaderViewport = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const update = () => {
      element.style.setProperty(
        '--reader-top',
        `${Math.max(0, element.getBoundingClientRect().top + window.scrollY)}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);

    if (element.parentElement) {
      observer.observe(element.parentElement);
    }

    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return ref;
};
