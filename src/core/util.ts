import { cloneDeep, isNil, range } from 'lodash';

export function findParentTd(el: HTMLElement): HTMLElement | null {
  if (!el) return null;
  if (el.tagName === 'TD') return el;
  return findParentTd(el.parentElement as HTMLElement);
}
export function extractDataRowAndCol(el: HTMLElement) {
  const row = Number(el.getAttribute('data-row'));
  const col = Number(el.getAttribute('data-col'));
  return {
    row,
    col,
  };
}
export function getRowColConfig(
  start?: Sheet.CellPosition,
  end?: Sheet.CellPosition,
) {
  const startRow = Math.min(start?.row ?? -1, end?.row ?? -1);
  const endRow = Math.max(start?.row ?? -1, end?.row ?? -1);
  const startCol = Math.min(start?.col ?? -1, end?.col ?? -1);
  const endCol = Math.max(start?.col ?? -1, end?.col ?? -1);
  return {
    startRow,
    endRow,
    startCol,
    endCol,
  };
}

export function flatRowColIndex(
  start?: Sheet.CellPosition,
  end?: Sheet.CellPosition,
) {
  const { startRow, endRow, startCol, endCol } = getRowColConfig(start, end);
  if ([startRow, endRow, startCol, endCol].some((a) => a === -1)) {
    return [];
  }
  const cellList: Sheet.CellPosition[] = [];

  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      cellList.push({ row: i, col: j });
    }
  }
  return cellList;
}

export function flatRowCol(
  start?: Sheet.CellPosition,
  end?: Sheet.CellPosition,
) {
  const rowColIndex = flatRowColIndex(start, end);
  return rowColIndex.map(({ row, col }) => `${row}-${col}`);
}

export function isInputKey(keyCode: number) {
  const numbersPressed = keyCode >= 48 && keyCode <= 57;
  const lettersPressed = keyCode >= 65 && keyCode <= 90;
  const latin1Supplement = keyCode >= 160 && keyCode <= 255;
  const numPadKeysPressed = keyCode >= 96 && keyCode <= 105;
  const equationKeysPressed =
    [
      187 /* equal */, 189 /* substract */, 190 /* period */, 107 /* add */,
      109 /* decimal point */, 110,
    ].indexOf(keyCode) > -1;

  return (
    numPadKeysPressed ||
    numbersPressed ||
    lettersPressed ||
    latin1Supplement ||
    equationKeysPressed
  );
}

export function classNames(...args: (string | null | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export function stringToClipboardData(
  str: string,
  clipboardData: DataTransfer | null = (window as any)?.clipboardData,
) {
  // navigator.clipboard.writeText(str);
  navigator.clipboard.writeText(str).then(
    () => {
      console.log('复制成功');
    },
    () => {
      console.error('复制失败');
    },
  );
}
export function clipboardDataToString(
  clipboardData: DataTransfer | null = (window as any)?.clipboardData,
) {
  return new Promise<string[][]>((resolve, reject) => {
    navigator.clipboard.readText().then((res) => {
      resolve(defaultParsePaste(res) as string[][]);
    });
  });
}

export function formatDataToCell({
  start,
  editing,
  end,
  data,
  pasteData,
  groupConfig,
  freePaste = false,
}: Partial<Sheet.UpdateStateType> & {
  pasteData: string[][];
  freePaste: boolean;
}) {
  if (editing || !data) return;
  const cells = flatRowColIndex(start, end);
  if (!cells.length) return;
  const rowCount = cells[cells.length - 1].row - cells[0].row + 1;
  if (!cells.length) return;
  const isMultiCells = cells.length > 1;
  const isSinglePaste = pasteData.length === 1 && pasteData[0].length === 1;

  // todo 超出行的处理
  const isExRow = (cells[cells.length - 1].row as number) > (data?.length || 0);

  const groupMap = groupConfigToGroupMap(groupConfig);
  const actualRowCount = range(start?.row ?? 0, (end?.row ?? 0) + 1).reduce(
    (left, index) => {
      if (
        groupMap.get(index) &&
        !groupMap.get(index)?.isStart &&
        !groupMap.get(index)?.isOpen
      ) {
        return left;
      }
      return left + 1;
    },
    0,
  );

  const changes: Sheet.CellData[] = [];
  if (isMultiCells && isSinglePaste) {
    // 选中多个单元格，粘贴单个数据
    cells.forEach(({ row, col }) => {
      if (data[row][col].readonly) return;
      if (
        groupMap.get(row) &&
        !groupMap.get(row)?.isStart &&
        !groupMap.get(row)?.isOpen
      ) {
        return;
      }

      changes.push({
        row,
        col,
        value: pasteData[0][0],
      } as any);
    });
    return { changes };
  }

  if (!isMultiCells) {
    // 选中单个单元格
    const { row, col } = cells[0];
    const extChanges: Sheet.CellData[] = [];
    let hasStartAndNotOpen = false;
    pasteData.forEach((rowData, i) => {
      rowData.forEach((cell, j) => {
        if (row + i >= data.length) {
          extChanges.push({
            row: row + i,
            col: col + j,
            value: pasteData[i][j],
          } as any);
        } else {
          if (data?.[row + i]?.[col + j]?.readonly) return;

          if (
            groupMap.get(row + i) &&
            !groupMap.get(row + i)?.isStart &&
            !groupMap.get(row + i)?.isOpen
          ) {
            hasStartAndNotOpen = true;
          }
          changes.push({
            row: row + i,
            col: col + j,
            value: pasteData[i][j],
          } as any);
        }
      });
    });
    if (hasStartAndNotOpen) {
      console.error('有折叠单元格，不可粘贴');
      return { changes: [], extChanges: [] };
    }

    return { changes, extChanges };
  } else {
    // 选中多个单元格，粘贴多个数据
    if (
      actualRowCount !== pasteData.length ||
      (cells.length / rowCount) * actualRowCount !==
        pasteData.length * pasteData[0].length
    ) {
      // 单元格数量不对
      return;
    }

    const { row: baseRow, col: baseCol } = cells[0];
    let pasteCount = 0;
    cells.forEach(({ row, col }) => {
      if (data[row][col].readonly) return;
      if (
        groupMap.get(row) &&
        !groupMap.get(row)?.isStart &&
        !groupMap.get(row)?.isOpen
      ) {
        return;
      }
      changes.push({
        row: row,
        col: col,
        value: pasteData[pasteCount++][col - baseCol],
      } as any);
    });
    return { changes };
  }
}

export const defaultParsePaste = (str: string) =>
  str.split(/\r\n|\n|\r/).map((row) => row.split('\t'));

export const defaultValueRenderer = (cell: Sheet.Cell) => cell.value;

export function renderValue(cell: Sheet.Cell, row?: number, col?: number) {
  const value = defaultValueRenderer(cell);
  return value === null || typeof value === 'undefined' ? '' : value;
}

export const optionsTransferToValue = (
  options: Sheet.OptionsType[],
  val: string,
) => {
  let values: string[] = [];

  for (let i = 0; i < options.length; i++) {
    const { label, value, children } = options[i];
    if (children) {
      values = optionsTransferToValue(children, val);
      if (values.length) {
        values = [value, ...values];
        break;
      }
    } else if (label === val) {
      values.push(value);
      break;
    } else {
      values = [];
    }
  }
  return values;
};

export const groupConfigToGroupMap = (
  rowGroupConfig?: Sheet.RowGroupConfig,
) => {
  const groupMap = new Map<
    number,
    Sheet.RowGroup & { isStart: boolean; isOpen: boolean }
  >();
  if (!rowGroupConfig || !rowGroupConfig.groups?.length) return groupMap;
  const { groups } = rowGroupConfig;
  groups?.forEach((group, index) => {
    const { groupStart, groupEnd } = group;
    for (let i = groupStart; i <= groupEnd; i++) {
      groupMap.set(i, {
        ...group,
        isStart: i === groupStart,
        isOpen: rowGroupConfig.groupOpen[index],
      });
    }
  });
  return groupMap;
};

export const changeGroupConfig = (
  rowGroupConfig: Sheet.RowGroupConfig,
  changeInfo: { add?: number; remove?: number },
) => {
  const groupMap = groupConfigToGroupMap(rowGroupConfig);
  if (!groupMap.size) return rowGroupConfig;
  const newGroups = cloneDeep(rowGroupConfig.groups);
  // 顺序是先增后减
  const { add, remove } = changeInfo;
  if (!isNil(add)) {
    for (let i = 0; i < newGroups.length; i++) {
      const { groupStart, groupEnd } = newGroups[i];
      if (groupStart >= add) {
        newGroups[i].groupStart++;
        newGroups[i].groupEnd++;
      } else if (groupStart < add && groupEnd >= add) {
        newGroups[i].groupEnd++;
      }
    }
  }
  if (!isNil(remove)) {
    for (let i = 0; i < newGroups.length; i++) {
      const { groupStart, groupEnd } = newGroups[i];
      if (groupStart > remove) {
        newGroups[i].groupStart--;
        newGroups[i].groupEnd--;
      } else if (groupStart <= remove && groupEnd > remove) {
        newGroups[i].groupEnd--;
      }
    }
  }
  return {
    ...rowGroupConfig,
    groups: newGroups,
  };
};

export const rowToActualRow = (
  row: number,
  groupConfig?: Sheet.RowGroupConfig,
) => {
  const groupMap = groupConfigToGroupMap(groupConfig);
  if (!groupMap.size) return row;
  groupMap.forEach((item, index) => {
    if (index <= row && !item?.isOpen && !item?.isStart) {
      row--;
    }
  });
  return row;
};

export const getRowHeight = (container: HTMLSpanElement) => {
  const h =
    (container.getElementsByTagName('td')[0]?.parentNode as HTMLTableRowElement)
      ?.clientHeight || 30;

  return h;
};
