// to do remove virtual list
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
    focusRef,
    className,
    data,
    disablePageClick,
    onChange,
    onCellsChanged,
    onContextMenu,
    scrollTimeStamp,
    onRecover,
    handleBack,
    onFocusInfo,
    onFocusKeep,
    rowClassName,
  } = props;

  const sheetWrapperRef = useRef<DataSheetType.refAssertion>(null);
  const [state, setState] = useState({
    ...defaultState,
    data,
    mouseDown: false,
    lastFocus: [],
  });
  const [focusInfo, setFocusInfo] =
    useState<{ id: string; column: number }[]>();

  const cachedData = useRef<DataSheetType.UpdateStateType>({
    ...defaultState,
    data,
    mouseDown: false,
    lastFocus: [],
  });

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

    setFocusInfo(cachedData.current.lastFocus);
    onFocusInfo(cachedData.current.lastFocus);
    // setRefreshTimeStamp(Date.now());
  };
  const setSelectedCells = (
    st: DataSheetType.cellPosition,
    ed: DataSheetType.cellPosition,
  ) => {
    cachedData.current = { ...cachedData.current, start: st, end: ed };
  };

  useEffect(() => {
    if (focusRef) {
      focusRef.current = {
        focusCell: setSelectedCells,
      };
    }
  }, [cachedData.current]);

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
      e.preventDefault();
      clearSelectedCells(startC, endC);
    } else if (enterKeyPressed && currentCellEditable) {
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
      updateState({ editing: startC, clear: startC, forceEdit: false });
    } else {
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

    if (ctrlKeyPressed) {
      if (keyCode === Z_KEY) {
        if (shiftKey) {
          onRecover && onRecover();
        } else {
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
      !onFocusKeep(e) &&
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

  const sheetContent = useMemo(() => {
    const rows = cachedData.current.data.map(
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
    );

    return rows;
  }, [rowClassName]);

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
        {sheetContent}
      </SheetShell>
    </span>
  );
};

export default Sheet;
