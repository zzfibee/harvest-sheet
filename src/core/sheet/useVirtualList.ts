import type { SheetType } from '@zhenliang/sheet/type';
import { isEqual, throttle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { getRowHeight, rowToActualRow } from '../util';

const extra = 20;

type VirtualConfig = {
  virtualStart: number;
  virtualEnd: number;
  paddingTop: number;
  paddingBottom: number;
};

// 虚拟列表
export const useVirtualList = (
  elementRef: React.RefObject<SheetType.refAssertion>,
  data: SheetType.Cell[][] = [],
  groupConfig: SheetType.RowGroupConfig,
  virtualized?: boolean,
) => {
  const [state, setState] = useState({
    virtualStart: 0,
    virtualEnd: virtualized
      ? Math.min(data.length - 1, 2 * extra)
      : data.length - 1,
    paddingTop: 0,
    paddingBottom: 0,
  });
  const { virtualStart, virtualEnd, paddingTop, paddingBottom } = state;
  const virtualRef = useRef<VirtualConfig | null>();
  const groupConfigRef = useRef<SheetType.RowGroupConfig>(groupConfig);
  useEffect(() => {
    groupConfigRef.current = groupConfig;
  }, [groupConfig]);

  useEffect(() => {
    if (!elementRef.current) return;

    //  当前位定高的表格，所以可以直接获取第一行的高度
    const rowHeight = getRowHeight(elementRef.current as HTMLSpanElement);
    const itemHeight = rowHeight || 30;

    const handleScroll = throttle(() => {
      const { scrollTop, clientHeight } = elementRef.current as HTMLSpanElement;
      const start = Math.floor(scrollTop / itemHeight) - extra;
      const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + extra;

      // todo 加入分组之后的 虚拟列表计算
      const actualStart = groupConfigRef.current
        ? rowToActualRow(start, groupConfigRef.current)
        : start;
      const actualEnd = groupConfigRef.current
        ? rowToActualRow(end, groupConfigRef.current)
        : end;

      // const minStart = start - (actualStart - start)
      const maxEnd = end - (actualEnd - end);

      // console.log('useVirtual', start, end);
      // console.log('useVirtual', actualStart, actualEnd);
      // console.log('useVirtual', actualStart, maxEnd);

      const updateVirtualConfig = {
        virtualStart: actualStart,
        virtualEnd: maxEnd,
        paddingTop: actualStart * itemHeight,
        paddingBottom: (data.length - maxEnd) * itemHeight,
      };

      if (isEqual(updateVirtualConfig, virtualRef.current)) {
        return;
      }
      setState(updateVirtualConfig);
      virtualRef.current = updateVirtualConfig;
    }, 50);
    // data.length change 的时候用 handleScroll 重设 virtual params
    handleScroll();

    elementRef.current.addEventListener('scroll', handleScroll);
    return () => {
      elementRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef.current, data.length]);

  if (!virtualized) {
    return {
      virtualStart: 0,
      virtualEnd: data.length,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }

  return {
    virtualStart: Math.max(0, virtualStart),
    virtualEnd: Math.min(data.length, virtualEnd),
    paddingTop: Math.max(0, paddingTop),
    paddingBottom: data.length - 1 <= virtualEnd ? 0 : paddingBottom,
  };
};
