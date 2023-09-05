import type { SheetType } from '@zhenliang/sheet/type';
import { isEqual, throttle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { getRowHeight } from '../util';

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

  useEffect(() => {
    if (!elementRef.current) return;

    //  当前位定高的表格，所以可以直接获取第一行的高度

    const rowHeight = getRowHeight(elementRef.current as HTMLSpanElement);

    const itemHeight = rowHeight || 30;

    setState({
      virtualStart: 0,
      virtualEnd: Math.min(data.length - 1, 2 * extra),
      paddingTop: 0,
      paddingBottom:
        (data.length - Math.min(data.length - 1, 2 * extra)) * itemHeight,
    });

    const handleScroll = throttle(() => {
      const { scrollTop, clientHeight } = elementRef.current as HTMLSpanElement;
      const start = Math.floor(scrollTop / itemHeight) - extra;
      const end = Math.ceil((scrollTop + clientHeight) / itemHeight) + extra;
      const updateVirtualConfig = {
        virtualStart: start,
        virtualEnd: end,
        paddingTop: start * itemHeight,
        paddingBottom: (data.length - end) * itemHeight,
      };
      if (isEqual(updateVirtualConfig, virtualRef.current)) {
        return;
      }
      setState(updateVirtualConfig);
      virtualRef.current = updateVirtualConfig;
    }, 50);

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

  console.log('useVirtualList', data.length - 1 <= virtualEnd, paddingBottom);
  return {
    virtualStart: Math.max(0, virtualStart),
    virtualEnd: Math.min(data.length, virtualEnd),
    paddingTop: Math.max(0, paddingTop),
    paddingBottom: data.length - 1 <= virtualEnd ? 0 : paddingBottom,
  };
};
