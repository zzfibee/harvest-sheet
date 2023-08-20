/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DefaultRow from './DefaultRow';
import DefaultShell from './DefaultShell';
import useCell from './useCell';
import useEventHandler from './useEventHandler';

import {
  BACKSPACE_KEY,
  defaultState,
  DELETE_KEY,
  ENTER_KEY,
  getLastFocus,
  getStartEnd,
  range,
  Z_KEY,
} from './helper';

import './index.less';

const Sheet = (props: DataSheetType.SheetProps) => {
  const {
    sheetRenderer: SheetShell = DefaultShell,
    rowRenderer: Row = DefaultRow,
    className,
    data,
    disablePageClick,
    onChange,
    onCellsChanged,
    onContextMenu,
    handleBack,
    rowClassName,
  } = props;

  const sheetWrapperRef = useRef<DataSheetType.refAssertion>(null);

  const cachedData = useRef<DataSheetType.UpdateStateType>({
    ...defaultState,
    data,
    mouseDown: false,
    lastFocus: [],
  });

  // 当updateState call 组件刷新
  const [refreshTimeStamp, setRefreshTimeStamp] = useState<number>(Date.now());

  const updateState = (
    state: Partial<DataSheetType.UpdateStateType>,
    saveFocus = false,
  ) => {
    const { start, end, data: newData } = state;
    let newState = {} as any;
    if (start && end) {
      const lastFocus = getLastFocus(
        start as DataSheetType.cellPosition,
        end as DataSheetType.cellPosition,
        cachedData.current,
      );
      if (lastFocus.length || !saveFocus) {
        newState = { lastFocus };
        // zoomTo(cachedData.current.start, cachedData.current.end);
      }
    } else if (newData) {
      newState = getStartEnd(cachedData.current, newData);
    }

    cachedData.current = { ...cachedData.current, ...state, ...newState };

    // 只是给外层的回到编辑提供位置信息，不带更新
    // 用于刷新组件
    setRefreshTimeStamp(Date.now());
  };

  const getSelectedCells = (
    st: DataSheetType.cellPosition,
    ed: DataSheetType.cellPosition,
  ) => {
    const { data: dataC } = cachedData.current;
    const selected: DataSheetType.cellData[] = [];
    const { rowIndex: rowIndexST, columnIndex: columnIndexST } = st;
    const { rowIndex, columnIndex } = ed;
    range(rowIndexST as number, rowIndex as number).forEach((row) => {
      range(columnIndexST as number, columnIndex as number).forEach((col) => {
        if (dataC[row] && dataC[row][col]) {
          selected.push({
            id: dataC[row][col].id,
            cell: dataC[row][col],
            row,
            col,
          });
        }
      });
    });
    return selected;
  };

  const onRevert = () => {
    updateState({ editing: {} });
    // setTimeout makes sure that component is done handling the new state before we take over
    setTimeout(() => {
      sheetWrapperRef.current?.focus({ preventScroll: true });
    }, 1);
  };

  const clearSelectedCells = useCallback(
    (st: DataSheetType.cellPosition, ed: DataSheetType.cellPosition) => {
      const cells = getSelectedCells(st, ed)
        .filter((cell) => !cell.cell.readOnly)
        .map((cell) => ({ ...cell, value: '' }));
      if (onCellsChanged) {
        onCellsChanged(cells);
        onRevert();
      } else if (onChange) {
        setTimeout(() => {
          cells.forEach(({ cell, row, col, value }) => {
            onChange(cell, row, col, value);
          });
          onRevert();
        }, 0);
      }
    },
    [onCellsChanged, onChange],
  );

  const { handleKeyboardCellMovement } = useEventHandler(
    props,
    cachedData,
    updateState,
    clearSelectedCells,
  );

  const cellsKeysHandler = (e: any) => {
    const keyCode = e.which || e.keyCode;
    const { start: startC, end: endC, data: dataC } = cachedData.current;

    const deleteKeysPressed =
      keyCode === DELETE_KEY || keyCode === BACKSPACE_KEY;
    const enterKeyPressed = keyCode === ENTER_KEY;
    const numbersPressed = keyCode >= 48 && keyCode <= 57;
    const lettersPressed = keyCode >= 65 && keyCode <= 90;
    const latin1Supplement = keyCode >= 160 && keyCode <= 255;
    const numPadKeysPressed = keyCode >= 96 && keyCode <= 105;
    const currentCellEditable =
      !dataC[startC.rowIndex as number][startC.columnIndex as number].readOnly;
    const equationKeysPressed =
      [
        187 /* equal */, 189 /* substract */, 190 /* period */, 107 /* add */,
        109 /* decimal point */, 110,
      ].indexOf(keyCode) > -1;

    if (deleteKeysPressed) {
      // 删除选中Cell
      e.preventDefault();
      clearSelectedCells(startC, endC);
    } else if (enterKeyPressed && currentCellEditable) {
      // 回车进入编辑
      updateState({ editing: startC, clear: {}, forceEdit: true });
      e.preventDefault();
    } else if (
      currentCellEditable &&
      (numbersPressed ||
        numPadKeysPressed ||
        lettersPressed ||
        latin1Supplement ||
        equationKeysPressed)
    ) {
      // 可编辑且输入为数字和字母
      updateState({ editing: startC, clear: startC, forceEdit: false });
    } else {
      // 选中 cell 移动
      handleKeyboardCellMovement(e);
    }
  };

  const handleKey = (e: any) => {
    if (e.isDefaultPrevented()) {
      return;
    }

    const { editing: editingC, start: startC } = cachedData.current;
    const { ctrlKey, metaKey, keyCode, shiftKey } = e;
    const isEditing = !isEmpty(editingC);
    const noCellsSelected = isEmpty(startC);
    const ctrlKeyPressed = ctrlKey || metaKey;

    //ctrl 的 handler
    if (ctrlKeyPressed) {
      if (keyCode === Z_KEY) {
        // ctrl + shift + z
        // 取消回滚
        if (shiftKey) {
          // onRecover && onRecover();
        } else {
          // ctrl + z
          handleBack && handleBack();
        }
      }
    } else if (!noCellsSelected && !isEditing) {
      cellsKeysHandler(e);
    }
  };

  const onMouseUp = () => {
    updateState({ selecting: false });
  };

  const pageClick = (e: Event) => {
    if (disablePageClick) {
      return;
    }
    const targetClassStr: string =
      (e.target as any).classList?.toString?.() || '';

    if (
      !sheetWrapperRef.current?.contains(e.target) &&
      !targetClassStr.includes('focusControl')
    ) {
      updateState(defaultState);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', pageClick);

    return () => {
      document.removeEventListener('mousedown', pageClick);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    updateState({ data });
  }, [data]);

  const isSelectedRow = (row: number) => {
    const {
      start: { rowIndex: rowIndexST },
      end: { rowIndex },
    } = cachedData.current;
    if (rowIndexST === undefined || rowIndex === undefined) {
      return false;
    }
    if (rowIndexST <= rowIndex) {
      return row >= rowIndexST && row <= rowIndex;
    }
    return row <= rowIndexST && row >= rowIndex;
  };

  const sheetShellClassNames = useMemo(
    () => ['data-grid', className].filter((a) => a).join(' '),
    [className],
  );

  const renderCell = useCell(
    props,
    cachedData,
    updateState,
    onRevert,
    onContextMenu,
  );

  const memoHeight = useMemo(() => {
    return Math.min(cachedData?.current?.data?.length ?? 0, 10) * 40 + 40;
  }, [cachedData.current.data.length]);

  return (
    <span
      ref={sheetWrapperRef}
      tabIndex={0}
      className="data-grid-container"
      onKeyDown={handleKey}
      style={{ minHeight: memoHeight, maxHeight: 440 }}
    >
      <SheetShell key="sheet" className={sheetShellClassNames}>
        {cachedData.current.data.map(
          (rowData: DataSheetType.Cell[], rowIndex: number) => {
            const selected = isSelectedRow(rowIndex);
            return (
              <Row
                key={rowIndex}
                row={rowIndex}
                cells={rowData}
                rowClassName={rowClassName}
                selected={selected}
              >
                {renderCell(rowData, rowIndex, handleKeyboardCellMovement)}
              </Row>
            );
          },
        )}
      </SheetShell>
    </span>
  );
};

export default Sheet;
