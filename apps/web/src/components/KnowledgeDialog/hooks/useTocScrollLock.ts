import { useEffect, useRef } from 'react';

/**
 * 目录跳转期间暂停滚动联动，滚动结束或用户主动接管时恢复。
 * scrollend 之外保留静止检测，兼容无动画、原地跳转及不支持该事件的环境。
 */
export const useTocScrollLock = () => {
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => () => releaseRef.current?.(), []);

  const lock = (scrollport: Element) => {
    releaseRef.current?.();

    const events =
      scrollport === document.scrollingElement ? document : scrollport;
    let timer: ReturnType<typeof setTimeout>;

    const release = () => {
      clearTimeout(timer);
      events.removeEventListener('scroll', onScroll);
      events.removeEventListener('scrollend', onEnd);
      events.removeEventListener('wheel', release);
      events.removeEventListener('touchstart', release);
      events.removeEventListener('pointerdown', release);
      events.removeEventListener('keydown', onKey);
      releaseRef.current = null;
    };

    const onScroll = (event: Event) => {
      if (event.target !== events) {
        return;
      }

      clearTimeout(timer);
      timer = setTimeout(release, 160);
    };

    const onEnd = (event: Event) => {
      if (event.target === events) {
        release();
      }
    };

    const onKey = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
        ].includes(event.key)
      ) {
        release();
      }
    };

    releaseRef.current = release;
    events.addEventListener('scroll', onScroll);
    events.addEventListener('scrollend', onEnd);
    events.addEventListener('wheel', release, { passive: true });
    events.addEventListener('touchstart', release, { passive: true });
    events.addEventListener('pointerdown', release);
    events.addEventListener('keydown', onKey);
    timer = setTimeout(release, 160);
  };

  return { releaseRef, lock };
};
