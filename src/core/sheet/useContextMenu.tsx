import { Dispatch, useSetState } from '@harvest/sheet/hooks';
import { useEffect } from 'react';
import { extractDataRowAndCol, findParentTd } from '../util';

export type MenuEvent = {
  showMenu: boolean;
  position: { top: number; left: number };
  cellPosition: Sheet.CellPosition;
};

export const useContextMenu = (
  dispatch: Dispatch,
  elementRef: React.RefObject<Sheet.refAssertion>,
  enableContextMenu: boolean = false,
) => {
  const [menuEvent, setMenuEvent] = useSetState({
    showMenu: false,
    position: { top: 0, left: 0 },
    cellPosition: { row: 0, col: 0 },
  });

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const currentCell = findParentTd(e.target as HTMLElement) as HTMLElement;
    if (!currentCell) return;
    const currentPos = extractDataRowAndCol(currentCell);
    dispatch({
      type: 'mouseDown',
      payload: { pos: currentPos, shiftKey: e.shiftKey },
    });

    // todo 优化边缘情况  transform
    setMenuEvent({
      showMenu: true,
      position: { top: e.clientY, left: e.clientX },
      cellPosition: currentPos,
    });
  };

  useEffect(() => {
    if (!elementRef.current || !enableContextMenu) return;
    const handleClose = (e: MouseEvent) => {
      setMenuEvent({ showMenu: false });
    };
    elementRef.current.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClose);
    document.addEventListener(
      'scroll',
      () => {
        setMenuEvent({ showMenu: false });
      },
      true,
    );
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClose);
    };
  }, [elementRef.current, enableContextMenu]);

  return {
    ...menuEvent,
  };
};
