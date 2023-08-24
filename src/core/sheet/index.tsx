import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect, useMemo, useRef } from 'react';
import ReduxThunk from 'redux-thunk';

import DefaultRow from './DefaultRow';
import DefaultShell from './DefaultShell';

import { isNil } from 'lodash';
import {
  SheetEventContext,
  useEventBus,
  useMiddlewareReducer,
} from '../../hooks';
import sheetReducer from '../reducers';
import { classNames, getRowHeight, rowToActualRow } from '../util';
import { DefaultRowMapper } from './DefaultRowMapper';
import './index.less';
import { useCellEvent } from './useCellEvent';
import { useContextMenu } from './useContextMenu';
import { useKeyBoardEvent } from './useKeyBoardEvent';
import { useMouseEvent } from './useMouseEvent';
import { useVirtualList } from './useVirtualList';

const Sheet: React.FC<SheetType.SheetProps> = (props) => {
  const {
    sheetInstance = { current: null },
    sheetRenderer: SheetShell = DefaultShell,
    rowRenderer: Row = DefaultRow,
    menuRenderer: ContextMenu,
    virtualized = false,
    className,
    data,
    freePaste = false,
    groupConfig = undefined,
    onCellsChanged,
    onContextMenu,
    rowClassName,
    scroll,
    children,
  } = props;
  const sheetWrapperRef = useRef<SheetType.refAssertion>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const eventBus = useEventBus();
  const [state, dispatch] = useMiddlewareReducer(
    sheetReducer,
    {
      data,
      mouseDown: false,
      editing: undefined,
      lastFocus: [],
      groupConfig,
      eventBus,
    },
    [ReduxThunk],
  );

  useEffect(() => {
    sheetInstance.current = {
      zoomTo: (row?: number) => {
        // 默认回到编辑行
        dispatch((d: unknown, getState: () => SheetType.UpdateStateType) => {
          const { start, groupConfig } = getState();
          if (!start && isNil(row)) return;
          const actual = rowToActualRow(
            (row as number) ?? start?.row,
            groupConfig,
          );
          console.log(actual);
          const rowHeight = getRowHeight(
            sheetWrapperRef.current as HTMLSpanElement,
          );
          sheetWrapperRef.current?.scrollTo(0, rowHeight * actual);
        });
      },
      pushToHistory: (config: SheetType.OperateHistory) => {
        dispatch({ type: 'pushHistory', payload: config });
      },
      selectRow: (row?: number) => {
        if (isNil(row)) {
          dispatch({ type: 'clearSelect' });
        } else {
          dispatch({ type: 'selectRow', payload: row });
        }
      },
      popHistory: () => {
        return {} as SheetType.OperateHistory;
      },
    };
  }, [sheetWrapperRef.current]);

  useEffect(() => {
    // 同步必要的状态
    dispatch({
      type: 'changes',
      payload: {
        cellChangeHandler: onCellsChanged,
        data,
        freePaste,
        groupConfig,
      },
    });
  }, [onCellsChanged, data, freePaste, groupConfig]);

  useCellEvent(dispatch, state);
  useMouseEvent(dispatch, sheetWrapperRef);
  useKeyBoardEvent(dispatch, sheetWrapperRef);

  const menu = useContextMenu(
    dispatch,
    sheetWrapperRef,
    !!ContextMenu,
    contextMenuRef,
  );

  // timeout 的副作用不适合放reducer里面
  useEffect(() => {
    if (!state.editing && state.start) {
      setTimeout(() => {
        // 表格获取焦点 + 接收keyboard event
        sheetWrapperRef.current?.focus({ preventScroll: true });
      }, 1);
    }
  }, [state.editing, state.start]);

  const { virtualStart, virtualEnd, paddingTop, paddingBottom } =
    useVirtualList(sheetWrapperRef, state.data, virtualized);

  useEffect(() => {
    dispatch({
      type: 'clearEdit',
    });
    dispatch({
      type: 'clearSelectIfNotSingleRow',
    });
  }, [groupConfig]);

  const rowElements = useMemo(() => {
    return state?.data?.map((rowData: SheetType.Cell[], row: number) => {
      return (
        <Row
          key={row}
          row={row}
          cells={rowData}
          groupConfig={groupConfig}
          rowClassName={rowClassName}
        >
          <DefaultRowMapper rowData={rowData} row={row} />
        </Row>
      );
    });
  }, [state.data, groupConfig]);

  const memoHeight = Math.min((state?.data?.length ?? 0) + 1, 10) * 42 + 43;

  return (
    <SheetEventContext.Provider value={eventBus}>
      <span
        ref={sheetWrapperRef}
        tabIndex={0}
        className={classNames('harvest harvest-sheet-container', className)}
        style={{
          maxHeight: scroll?.y ?? memoHeight,
          width: scroll?.x ?? '100%',
        }}
      >
        <SheetShell
          key="sheet"
          className={classNames('harvest-sheet', className)}
        >
          {virtualized && (
            <tr
              style={{ height: 0, paddingBottom: paddingTop, display: 'block' }}
            />
          )}
          {rowElements?.slice(virtualStart, virtualEnd)}
          {/* {rowElements} */}
          <tr
            style={{
              height: 0,
              paddingBottom: paddingBottom,
              display: 'block',
            }}
          />
        </SheetShell>
        {ContextMenu ? (
          <div
            ref={contextMenuRef}
            style={{ display: menu.showMenu ? '' : 'none' }}
          >
            <ContextMenu
              position={menu.position}
              cell={menu.cellPosition}
              onContextMenu={onContextMenu}
            />
          </div>
        ) : null}
        <div className="harvest-sheet-control">{children}</div>
      </span>
    </SheetEventContext.Provider>
  );
};

export default Sheet;
