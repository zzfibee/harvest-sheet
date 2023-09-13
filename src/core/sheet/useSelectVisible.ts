import { SheetType } from '@zhenliang/sheet/type';
import { throttle } from 'lodash';
import { useEffect, useState } from 'react';

export const useSelectVisible = (
  sheetWrapper: React.RefObject<SheetType.refAssertion>,
  start?: SheetType.CellPosition,
) => {
  const [startVisible, setStartVisible] = useState(true);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!start) {
        return;
      }
      const startCell = sheetWrapper.current?.querySelector(
        `td.cell[data-row='${start.row}']`,
      ) as HTMLElement;

      if (!startCell) return false;
      const { top = 0, bottom = 0 } =
        sheetWrapper.current?.getBoundingClientRect() || {};
      const { top: cellTop, bottom: cellBottom } =
        startCell?.getBoundingClientRect() || {};

      if (top < cellTop && bottom > cellBottom) {
        setStartVisible(true);
      } else {
        setStartVisible(false);
      }
    }, 100);
    handleScroll();
    sheetWrapper.current?.addEventListener('scroll', handleScroll);

    return () => {
      sheetWrapper.current?.removeEventListener('scroll', handleScroll);
    };
  }, [sheetWrapper.current, start]);

  if (!start) {
    return true;
  }
  return startVisible;
};
