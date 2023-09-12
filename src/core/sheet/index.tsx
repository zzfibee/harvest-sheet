import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect, useMemo, useRef } from 'react';
import ReduxLogger from 'redux-logger';
import ReduxThunk from 'redux-thunk';

import DefaultRow from './DefaultRow';
import DefaultShell from './DefaultShell';

import { Button } from 'antd';
import { isNil, isNumber } from 'lodash';
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
    showBackEdit,
    backEditStyle,
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
    [ReduxThunk, ReduxLogger],
  );

  useEffect(() => {
    sheetInstance.current = {
      zoomTo: (row?: number) => {
        // 给定 row 回到行
        // 不给定 row 默认回到编辑行和列
        dispatch((d: unknown, getState: () => SheetType.UpdateStateType) => {
          const { start, groupConfig } = getState();
          const container = sheetWrapperRef.current as HTMLSpanElement;
          if (!start && isNil(row)) return;
          const actual = rowToActualRow(
            (row as number) ?? start?.row,
            groupConfig,
          );
          const rowHeight = getRowHeight(container);
          const firstRowCell = container.querySelector(
            `td.cell[data-col='${start?.col}']`,
          ) as HTMLElement;
          let colPosition = firstRowCell
            ? firstRowCell.offsetLeft - firstRowCell.clientWidth
            : 0;

          sheetWrapperRef.current?.scrollTo(
            isNumber(row) ? 0 : colPosition,
            rowHeight * actual,
          );
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
      select: (props) => {
        dispatch({ type: 'select', payload: props });
      },
      popHistory: () => {
        const { history } = state;
        dispatch({ type: 'popHistory' });
        return history?.length
          ? history?.[history.length - 1]
          : ({} as SheetType.OperateHistory);
      },
    };
  }, [sheetWrapperRef.current, state.history]);

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
    useVirtualList(sheetWrapperRef, state.data, groupConfig, virtualized);

  useEffect(() => {
    dispatch({
      type: 'clearEdit',
    });
    dispatch({
      type: 'clearSelectIfNotSingleRow',
    });
  }, [groupConfig]);

  const rowElements = useMemo(() => {
    return state?.data
      ?.slice(virtualStart, virtualEnd)
      ?.map((rowData: SheetType.Cell[]) => {
        const row = state?.data?.indexOf(rowData) || 0;
        const rowCN =
          rowClassName instanceof Function
            ? rowClassName?.(rowData?.[rowData.length - 1]?.record as any, row)
            : rowClassName;
        return (
          <Row
            key={row}
            row={row}
            cells={rowData}
            groupConfig={groupConfig}
            rowClassName={rowCN}
          >
            <DefaultRowMapper rowData={rowData} row={row} />
          </Row>
        );
      });
  }, [state.data, groupConfig, virtualStart, virtualEnd, rowClassName]);

  const memoHeight = Math.min((state?.data?.length ?? 0) + 1, 10) * 42 + 43;
  const startRowVisible = useMemo(() => {
    if (isNil(state.start)) return true;
    const startCell = sheetWrapperRef.current?.querySelector(
      `td.cell[data-row='${state.start.row}']`,
    ) as HTMLElement;
    if (!startCell) return false;
    const { top = 0, bottom = 0 } =
      sheetWrapperRef.current?.getBoundingClientRect() || {};
    const { top: cellTop, bottom: cellBottom } =
      startCell?.getBoundingClientRect() || {};

    if (top < cellTop && bottom > cellBottom) {
      return true;
    }
    return false;
  }, [state.start, virtualStart, virtualEnd]);

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
              style={{
                height: 0,
                paddingBottom: paddingTop,
                display: 'block',
              }}
            />
          )}
          {/* {rowElements?.slice(virtualStart, virtualEnd)} */}
          {rowElements}
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
        <div className="harvest-sheet-control">
          {children}
          {showBackEdit && !startRowVisible ? (
            <Button
              type="dashed"
              onClick={() => sheetInstance?.current?.zoomTo()}
              style={{
                position: 'absolute',
                zIndex: 4,
                ...(!backEditStyle
                  ? {
                      top: 0,
                      right: 0,
                    }
                  : backEditStyle),
              }}
            >
              回到编辑行
            </Button>
          ) : null}
        </div>
      </span>
    </SheetEventContext.Provider>
  );
};

export default Sheet;
