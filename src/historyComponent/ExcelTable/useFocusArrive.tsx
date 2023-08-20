import { ArrowDownOutlined, ArrowUpOutlined } from '@harvest/sheet/svgs';
import classNames from 'classnames';
import { eq } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './index.less';

const useFocusArrive = (
  tableId: string,
  indexInfo: { startIndex: number; endIndex: number },
  visualDataRef: React.MutableRefObject<number>,
  scrollTopRef: React.MutableRefObject<number>,
  allGrid: ExcelTableType.Grid[][],
  grid: ExcelTableType.Grid[][],
  rowHeight: number,
  setIndexInfo: (info: { startIndex: number; endIndex: number }) => void,
) => {
  const focusDataInfo = useRef<{ startIndex?: number; endIndex?: number }>(
    indexInfo,
  );
  const tableRef = useRef<HTMLDivElement>();
  const [ratio, setRatio] = useState<number>();

  const [focusInfo, setFocusInfo] = useState<
    DataSheetType.UpdateStateType['lastFocus']
  >([]);

  useEffect(() => {
    tableRef.current = document.getElementById(`${tableId}`) as HTMLDivElement;
  }, [tableId]);
  useEffect(() => {
    if (!tableRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    const minLength = Math.max(100, visualDataRef.current);
    const threshold = Array.from({ length: minLength }).map(
      (item, index) => (1 / minLength) * (index + 1),
    );
    let io: IntersectionObserver | undefined = new IntersectionObserver(
      (entries) => {
        const rate = entries[0].intersectionRatio;
        setRatio(rate);
      },
      { threshold },
    );
    io.observe(tableRef.current);
    return () => {
      if (tableRef.current) {
        io?.unobserve(tableRef.current);
      }
      io?.disconnect();
      io = undefined;
    };
  }, [tableRef.current, visualDataRef.current]);

  const handleFocusInfo = useCallback(
    (lastFocus: DataSheetType.UpdateStateType['lastFocus']) => {
      if (!eq(lastFocus, focusInfo)) {
        setFocusInfo(lastFocus);
      }
    },
    [focusInfo],
  );

  const canArriveFocus = useMemo(() => {
    const { startIndex, endIndex } = indexInfo;
    const { length } = focusInfo;
    let arrival = 0;
    const visualIndex = visualDataRef.current;

    if (tableRef.current) {
      // const { bottom: actualBottom ,top:actualTop} = tableRef.current.getBoundingClientRect();
      const bottom = document.body.clientHeight;
      const selected = tableRef.current?.querySelectorAll('td.selected');
      if (selected?.[0]) {
        const { bottom: cellBottom } = selected[0].getBoundingClientRect();
        arrival = cellBottom > bottom - 64 ? 2 : 0;
      }
    }

    if (length > 0 && endIndex - startIndex > visualIndex - 1) {
      const currentIndex = Math.floor(scrollTopRef.current / 40);

      const start = allGrid.findIndex((d) => d[0].id === focusInfo[0].id);
      const end = allGrid.findIndex(
        (d) => d[0].id === focusInfo[length - 1].id,
      );
      if (currentIndex > start) {
        arrival = 1;
      } else if (currentIndex + visualIndex - 2 < end) {
        arrival = 2;
      }
    }
    return arrival;
  }, [focusInfo, grid, rowHeight, tableRef.current, ratio]);

  useEffect(() => {
    if (canArriveFocus) {
      focusDataInfo.current = { ...indexInfo };
    } else {
      focusDataInfo.current = {};
    }
  }, [canArriveFocus]);

  const handleFocusArrived = () => {
    const { startIndex, endIndex } = focusDataInfo.current;

    setIndexInfo({
      startIndex: startIndex as number,
      endIndex: endIndex as number,
    });

    const span: HTMLElement | null = document.querySelector<HTMLElement>(
      `#${tableId}`,
    );

    const selected = span?.querySelectorAll('td.selected');
    if (selected?.length) {
      selected[0]?.scrollIntoView({
        block: 'center',
        behavior: 'auto',
      });
    } else {
      const focusStart = allGrid.findIndex((d) => d[0].id === focusInfo[0].id);

      const scrollableRow = allGrid.length - visualDataRef.current + 1;

      let scrollTop = focusStart * rowHeight;
      if (focusStart > scrollableRow) {
        scrollTop = scrollableRow * rowHeight;
      }

      span?.scrollTo({ top: scrollTop });
    }
  };

  const handleFocusKeep = (
    e: MouseEvent & { target: { classList: { value: string } } },
  ) => {
    const {
      classList: { value },
    } = e.target;
    return value.includes(tableId);
  };

  const focusControl = useMemo(() => {
    if (canArriveFocus) {
      return (
        <span className={'focusControl'}>
          {(canArriveFocus === 1 && <ArrowUpOutlined />) || (
            <ArrowDownOutlined />
          )}
          返回编辑行
          <span
            className={classNames(tableId, 'focusOperation')}
            onClick={handleFocusArrived}
          />
        </span>
      );
    }

    return null;
  }, [canArriveFocus]);

  return [focusControl, handleFocusKeep, handleFocusInfo, handleFocusArrived];
};

export default useFocusArrive;
