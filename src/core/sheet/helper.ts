import { isEmpty } from 'lodash';

export const defaultState = {
  start: {},
  end: {},
  selecting: false,
  forceEdit: false,
  editing: {},
  clear: {},
  mouseDown: false,
};

export const TAB_KEY = 9;
export const ENTER_KEY = 13;
export const ESCAPE_KEY = 27;
export const LEFT_KEY = 37;
export const UP_KEY = 38;
export const RIGHT_KEY = 39;
export const DOWN_KEY = 40;
export const DELETE_KEY = 46;
export const BACKSPACE_KEY = 8;
export const Z_KEY = 90;
export const C_KEY = 67;
export const V_KEY = 86;
export const X_KEY = 88;

// ================================================================

export const range = (start: number, end: number) => {
  const array = [];
  const inc = end - start > 0;
  for (let i = start; inc ? i <= end : i >= end; inc ? i++ : i--) {
    if (inc) {
      array.push(i);
    } else {
      array.unshift(i);
    }
  }
  return array;
};

export const defaultParsePaste = (str: string) =>
  str.split(/\r\n|\n|\r/).map((row) => row.split('\t'));

export const defaultValueRenderer = (cell: Sheet.Cell) => cell.value;

export function renderValue(cell: Sheet.Cell, row?: number, col?: number) {
  const value = defaultValueRenderer(cell);
  return value === null || typeof value === 'undefined' ? '' : value;
}
export const previousRow = (
  location: { row: number; column: number },
  data: DataSheetType.Cell[][],
) => ({
  row: location.row - 1,
  column: data[0].length - 1,
});

export const nextRow = (location: { row: number; column: number }) => ({
  row: location.row + 1,
  column: 0,
});

export const advanceOffset = (
  location: { row: number; column: number },
  offsets: { row: number; column: number },
) => ({
  row: location.row + offsets.row,
  column: location.column + offsets.column,
});

export const isCellDefined = (
  { row, column }: { row: number; column: number },
  data: DataSheetType.Cell[][],
) => data[row] && typeof data[row][column] !== 'undefined';

export const getLastFocus = (
  start: DataSheetType.cellPosition,
  end: DataSheetType.cellPosition,
  cachedData: DataSheetType.UpdateStateType,
) => {
  const lastFocus: {
    id: string;
    column: number;
  }[] = [];
  const {
    start: cachedStart,
    end: cachedEnd,
    data: d,
    lastFocus: oldLastFocus,
  } = cachedData;

  if (oldLastFocus.length === 0 && isEmpty(start) && isEmpty(end)) {
    // 这里还有点问题 bug
    const startRow = Math.min(
      cachedStart.rowIndex as number,
      cachedEnd.rowIndex as number,
    );
    const endRow = Math.max(
      cachedStart.rowIndex as number,
      cachedEnd.rowIndex as number,
    );

    const startColumn = Math.min(
      cachedStart.columnIndex as number,
      cachedEnd.columnIndex as number,
    );
    const endColumn = Math.max(
      cachedStart.columnIndex as number,
      cachedEnd.columnIndex as number,
    );

    for (let i = startRow as number; i <= (endRow as number); i++) {
      for (let j = startColumn as number; j <= (endColumn as number); j++) {
        const { id } = d[i]?.[j] || {};
        if (id) {
          lastFocus.push({ id, column: j });
        }
      }
    }
  }
  return lastFocus;
};

export const getStartEnd = (
  cachedData: DataSheetType.UpdateStateType,
  newData: DataSheetType.Cell[][],
) => {
  const { lastFocus, start: oldStart, end: oldEnd } = cachedData;
  let start = { ...oldStart };
  let end = { ...oldEnd };
  const { length } = lastFocus;
  if (length === 1) {
    const { id, column } = lastFocus[0];
    const row = newData.findIndex((rowData) => rowData[0].id === id);
    if (row !== -1) {
      start = { rowIndex: row, columnIndex: column };
      end = start;
    }
  } else if (length > 1) {
    const { id: startId, column: startColumn } = lastFocus[0];
    const { id, column } = lastFocus[length - 1];
    const startRow = newData.findIndex((rowData) => rowData[0].id === startId);
    const endRow = newData.findIndex((rowData) => rowData[0].id === id);

    if (startRow !== -1 && endRow !== -1) {
      start = { rowIndex: startRow, columnIndex: startColumn };
      end = { rowIndex: endRow, columnIndex: column };
    }
  }

  return { start, end };
};
