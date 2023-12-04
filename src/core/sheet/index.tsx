import type { SheetType } from '@zhenliang/sheet/type';
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
// import ReduxLogger from 'redux-logger';
import ReduxThunk from 'redux-thunk';

import DefaultRow from './DefaultRow';
import DefaultShell from './DefaultShell';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useGroup } from '@zhenliang/sheet/hooks/useGroupConfig';
import { Empty } from 'antd';
import { isEmpty, isNil, isNumber } from 'lodash';
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
import { useSelectVisible } from './useSelectVisible';
import { useVirtualList } from './useVirtualList';

const Sheet: React.FC<SheetType.SheetProps> = (props) => {
  const {
    sheetInstance = { current: null },
    sheetRenderer: SheetShell = DefaultShell,
    emptyRenderer = <Empty description="暂无数据" />,
    rowRenderer: Row = DefaultRow,
    menuRenderer: ContextMenu,
    virtualized = false,
    className,
    data,
    freePaste = false,
    // groupConfig = undefined,
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
  const { config: groupConfig } = useGroup();
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
    // [ReduxThunk, ReduxLogger],
    [ReduxThunk],
  );
  useImperativeHandle(
    sheetInstance,
    () => ({
      zoomTo: (row?: number) => {
        // 给定 row 回到行
        // 不给定 row 默认回到编辑行和列
        dispatch((d: unknown, getState: () => SheetType.UpdateStateType) => {
          const { start, groupConfig, data } = getState();
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

          const scrollHeight = actual * rowHeight;
          sheetWrapperRef.current?.scrollTo(
            isNumber(row) ? 0 : colPosition,
            scrollHeight,
          );

          // 最后一行的bug暂时用 scroll end 事件来处理
          if (
            isNil(row) &&
            start.row === data.length - 1 &&
            sheetWrapperRef.current
          ) {
            const handleScrollEnd = () => {
              sheetWrapperRef.current?.scrollTo(
                isNumber(row) ? 0 : colPosition,
                scrollHeight,
              );
              sheetWrapperRef.current?.removeEventListener(
                'scrollend',
                handleScrollEnd,
              );
            };

            sheetWrapperRef.current.addEventListener(
              'scrollend',
              handleScrollEnd,
            );
          }
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
    }),
    [state.history],
  );

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

  const visibleData = useMemo(
    () =>
      groupConfig?.groups?.length
        ? state.data?.filter((item, index) =>
            groupConfig?.configMap.has(index)
              ? groupConfig?.configMap.get(index)?.isOpen ||
                groupConfig?.configMap.get(index)?.isStart
              : true,
          )
        : state.data,
    [state.data, groupConfig],
  );

  const { virtualStart, virtualEnd, paddingTop, paddingBottom } =
    useVirtualList(sheetWrapperRef, visibleData, virtualized);

  useEffect(() => {
    dispatch({
      type: 'clearEdit',
    });
    dispatch({
      type: 'clearSelectIfNotSingleRow',
    });
  }, [groupConfig]);

  const rowElements = useMemo(() => {
    return visibleData
      ?.slice(virtualStart, virtualEnd)
      ?.map((rowData: SheetType.Cell[]) => {
        const row = rowData[0]?.row || 0;

        const rowCN =
          rowClassName instanceof Function
            ? rowClassName?.(rowData?.[rowData.length - 1]?.record as any, row)
            : rowClassName;
        return (
          <Row key={row} row={row} cells={rowData} rowClassName={rowCN}>
            <DefaultRowMapper rowData={rowData} row={row} />
          </Row>
        );
      });
  }, [visibleData, groupConfig, virtualStart, virtualEnd, rowClassName]);

  const memoHeight = Math.min((visibleData?.length ?? 0) + 1, 10) * 42 + 43;

  const [startRowVisible, direction] = useSelectVisible(
    sheetWrapperRef,
    state.start,
  );

  return (
    <SheetEventContext.Provider value={eventBus}>
      <span>
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
            {virtualized && paddingTop > 0 && (
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
            {virtualized && paddingBottom > 0 && (
              <tr
                style={{
                  height: 0,
                  paddingBottom: paddingBottom,
                  display: 'block',
                }}
              />
            )}
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
        </span>
        {isEmpty(state.data) || isNil(state.data) ? (
          <div style={{ marginTop: 16, marginBottom: 16 }}>{emptyRenderer}</div>
        ) : null}

        <div className="harvest-sheet-control">
          {children}
          {showBackEdit && !startRowVisible ? (
            <div
              className="back-edit"
              onClick={() => sheetInstance?.current?.zoomTo()}
              style={
                !backEditStyle
                  ? {
                      top: 0,
                      right: 0,
                    }
                  : (backEditStyle as any)
              }
            >
              {direction === 'up' ? (
                <ArrowUpOutlined rev={undefined} />
              ) : (
                <ArrowDownOutlined rev={undefined} />
              )}
              <span style={{ marginLeft: 0 }}>返回编辑行</span>
            </div>
          ) : null}
        </div>
      </span>
    </SheetEventContext.Provider>
  );
};

export default Sheet;
