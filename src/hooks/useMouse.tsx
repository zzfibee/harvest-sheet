import { debounce } from 'lodash';
import { useCallback, useEffect } from 'react';

type MouseHandler = {
  mouseUp: (value: MouseEvent) => void;
  mouseDown: (value: MouseEvent) => void;
  mouseOver: (value: MouseEvent) => void;
  mouseLeave: (value: MouseEvent) => void;
  mouseEnter: (value: MouseEvent) => void;
  doubleClick: (value: MouseEvent) => void;
  loseFocus: (value: MouseEvent) => void;
};

export const useMouse = (
  handler: MouseHandler,
  listenElement: HTMLSpanElement | null,
) => {
  const {
    mouseUp,
    mouseDown,
    mouseOver,
    mouseLeave,
    mouseEnter,
    doubleClick,
    loseFocus,
  } = handler;

  // todo
  const wrapper = useCallback(
    (handle: (e: MouseEvent) => void) => {
      return (e: MouseEvent) => {
        if (!(listenElement as any).contains(e.target as HTMLElement)) {
          return;
        }
        handle(e);
      };
    },
    [listenElement],
  );

  // useEffect(() => {
  //   if (!listenElement) return;
  // }, [mouseUp]);
  useEffect(() => {
    if (!listenElement) return;

    const debounceOver = debounce(mouseOver, 10);
    const wrappedMouseUp = mouseUp;
    const wrappedMouseDown = (e: MouseEvent) => {
      if (!listenElement.contains(e.target as HTMLElement)) {
        loseFocus(e);
        return;
      }
      mouseDown(e);
    };
    const wrappedMouseDoubleClick = wrapper(doubleClick);

    document.addEventListener('mouseup', wrappedMouseUp);
    document.addEventListener('mousedown', wrappedMouseDown);
    document.addEventListener('dblclick', wrappedMouseDoubleClick);
    listenElement.addEventListener('mouseover', debounceOver);
    listenElement.addEventListener('mouseleave', mouseLeave);
    listenElement.addEventListener('mouseenter', mouseEnter);
    return () => {
      listenElement.removeEventListener('mouseover', debounceOver);
      listenElement.removeEventListener('mouseleave', mouseLeave);
      listenElement.removeEventListener('mouseenter', mouseEnter);

      document.removeEventListener('mousedown', wrappedMouseUp);
      document.removeEventListener('mouseup', wrappedMouseDown);
      document.removeEventListener('dblclick', wrappedMouseDoubleClick);
    };
  }, [
    listenElement,
    mouseUp,
    mouseDown,
    mouseOver,
    mouseLeave,
    doubleClick,
    loseFocus,
  ]);
};
