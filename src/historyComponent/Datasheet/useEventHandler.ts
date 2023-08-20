import { useEffect, useCallback } from 'react';
import { message } from 'antd';
import { isEmpty } from 'lodash';

import {
  range,
  defaultParsePaste,
  TAB_KEY,
  ENTER_KEY,
  LEFT_KEY,
  UP_KEY,
  RIGHT_KEY,
  DOWN_KEY,
  previousRow,
  nextRow,
  advanceOffset,
  isCellDefined,
  defaultValueRenderer,
} from './helper';

const useEventHandler = (
  props: DataSheetType.SheetProps,
  cachedData: { current: DataSheetType.UpdateStateType },
  updateState: (state: Partial<DataSheetType.UpdateStateType>) => void,
  clearSelectedCells: (st: DataSheetType.cellPosition, ed: DataSheetType.cellPosition) => void
) => {
  const { onCellsChanged, isCellNavigable, freePaste } = props;
  const updateLocationMultipleCells = (offsets: { row: number; column: number }) => {
    const {
      end: { rowIndex, columnIndex },
      data: dataC,
    } = cachedData.current;
    if (rowIndex !== undefined && columnIndex !== undefined) {
      const newEndLocation = {
        rowIndex: rowIndex + offsets.row,
        columnIndex: Math.min(dataC[0].length - 1, Math.max(0, columnIndex + offsets.column)),
      };
      updateState({
        end: newEndLocation,
        editing: {},
      });
    }
  };

  const searchForNextSelectablePos = (
    isNavigable: DataSheetType.CellNavigable,
    location: { row: number; column: number },
    offsets: { row: number; column: number },
    jumpRow?: boolean
  ): { row: number; column: number } | null => {
    let newLocation = advanceOffset(location, offsets);
    const { row, column } = newLocation;

    const { data: dataC } = cachedData.current;

    while (isCellDefined(newLocation, dataC) && !isNavigable(dataC[row][column], row, column)) {
      newLocation = advanceOffset(newLocation, offsets);
    }

    if (!isCellDefined(newLocation, dataC)) {
      if (!jumpRow) {
        return null;
      }
      if (offsets.column < 0) {
        newLocation = previousRow(newLocation, dataC);
      } else {
        newLocation = nextRow(newLocation);
      }
    }

    if (isCellDefined(newLocation, dataC) && !isNavigable(dataC[row][column], row, column)) {
      return searchForNextSelectablePos(isNavigable, newLocation, offsets, jumpRow);
    }
    if (isCellDefined(newLocation, dataC)) {
      return newLocation;
    }
    return null;
  };

  const updateLocationSingleCell = (location: { row: number; column: number }) => {
    const { row: rowIndex, column: columnIndex } = location;
    const newStart = { rowIndex, columnIndex };
    updateState({ start: newStart, end: newStart });
  };

  const handleNavigate = (e: any, offsets: { row: number; column: number }, jumpRow?: boolean) => {
    if (offsets && (offsets.row || offsets.column)) {
      const multiSelect = e.shiftKey && !jumpRow;
      const isNavigable = isCellNavigable || (() => true);

      if (multiSelect) {
        updateLocationMultipleCells(offsets);
      } else {
        const { rowIndex, columnIndex } = cachedData.current.start;
        const newLocation = searchForNextSelectablePos(
          isNavigable,
          { row: rowIndex as number, column: columnIndex as number },
          offsets,
          jumpRow
        );
        if (newLocation) {
          updateLocationSingleCell(newLocation);
        }
      }
      e.preventDefault();
    }
  };

  const handleKeyboardCellMovement = (e: any, commit = false) => {
    const { editing: editingC, start: startC, data: dataC } = cachedData.current;
    const isEditing = editingC && !isEmpty(editingC);
    const currentCell: any =
      (startC?.rowIndex && startC?.columnIndex && dataC?.[startC.rowIndex]?.[startC.columnIndex]) || {};

    if (isEditing && !commit) {
      return;
    }
    const hasComponent = currentCell?.component || false;

    const keyCode = e.which || e.keyCode;

    if (hasComponent && isEditing) {
      e.preventDefault();
      // eslint-disable-next-line consistent-return
      return;
    }

    if (keyCode === TAB_KEY) {
      handleNavigate(e, { row: 0, column: e.shiftKey ? -1 : 1 }, true);
    } else if (keyCode === RIGHT_KEY) {
      handleNavigate(e, { row: 0, column: 1 });
    } else if (keyCode === LEFT_KEY) {
      handleNavigate(e, { row: 0, column: -1 });
    } else if (keyCode === UP_KEY) {
      handleNavigate(e, { row: -1, column: 0 });
    } else if (keyCode === DOWN_KEY) {
      handleNavigate(e, { row: 1, column: 0 });
    } else if (commit && keyCode === ENTER_KEY) {
      handleNavigate(e, { row: e.shiftKey ? -1 : 1, column: 0 });
    }
  };

  const handleCopy = useCallback((e: ClipboardEvent) => {
    const { editing: editingC, data: dataC, selecting, forceEdit, mouseDown, end, start } = cachedData.current;
    if (isEmpty(editingC) && !selecting && !forceEdit && !mouseDown && isEmpty(end) && isEmpty(start)) {
      return;
    }
    if (isEmpty(editingC)) {
      e.preventDefault();
      const {
        start: { rowIndex: rowIndexST, columnIndex: columnIndexST },
        end: { rowIndex, columnIndex },
      } = cachedData.current as any;
      const totalCellNumber = (Math.abs(rowIndex - rowIndexST) + 1) * (Math.abs(columnIndex - columnIndexST) + 1);
      const text = range(rowIndexST as number, rowIndex as number)
        .map((i) =>
          range(columnIndexST as number, columnIndex as number)
            .map((j) => {
              const cell = dataC[i][j];
              return defaultValueRenderer(cell);
            })
            .join('\t')
        )
        .join('\n');
      message.destroy();
      message.success(`已复制${totalCellNumber}个单元格`, 1.2);
      if ((window as DataSheetType.windowAssertion)?.clipboardData?.setData) {
        (window as unknown as DataSheetType.windowAssertion)?.clipboardData?.setData?.('Text', text);
      } else {
        e?.clipboardData?.setData('text/plain', text);
      }
    }
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const { editing: editingC, data: dataC } = cachedData.current;
      if (isEmpty(editingC)) {
        const {
          start: { rowIndex: rowIndexST, columnIndex: columnIndexST },
          end: { rowIndex, columnIndex },
        } = cachedData.current;

        const startNew = {
          rowIndex: Math.min(rowIndexST as number, rowIndex as number),
          columnIndex: Math.min(columnIndexST as number, columnIndex as number),
        };
        let endNew = {
          rowIndex: Math.max(rowIndexST as number, rowIndex as number),
          columnIndex: Math.max(columnIndexST as number, columnIndex as number),
        };
        const isMultiCells = rowIndexST !== rowIndex || columnIndexST !== columnIndex;

        const changes: DataSheetType.cellData[] = [];
        let pasteData: string[][] = [];
        if ((window as DataSheetType.windowAssertion)?.clipboardData?.getData) {
          // IE
          const str = (window as unknown as DataSheetType.windowAssertion).clipboardData?.getData?.('Text');
          pasteData = defaultParsePaste(str ?? '');
        } else if (e?.clipboardData?.getData) {
          pasteData = defaultParsePaste(e.clipboardData.getData('text/plain'));
        }

        const isSinglePaste = pasteData.length === 1 && pasteData[0].length === 1;

        // in order of preference
        if (onCellsChanged) {
          const additions: any = [];
          let additionsId = 0;
          if (isSinglePaste && isMultiCells) {
            const value = pasteData[0][0];
            for (let i = startNew.rowIndex; i <= endNew.rowIndex; i++) {
              for (let j = startNew.columnIndex; j <= endNew.columnIndex; j++) {
                const cell = dataC[i] && dataC[i][j];
                if (cell && !cell.readOnly) {
                  changes.push({ id: cell.id, cell, row: i, col: j, value });
                }
              }
            }
          } else {
            pasteData.forEach((row: string[], i: number) => {
              if (!(i === pasteData.length - 1 && row.length === 1 && row[0] === '')) {
                additionsId -= 1;
                row.forEach((value, j: number) => {
                  endNew = { rowIndex: startNew.rowIndex + i, columnIndex: startNew.columnIndex + j };
                  const cell = dataC[endNew.rowIndex] && dataC[endNew.rowIndex][endNew.columnIndex];
                  if (!cell) {
                    if (freePaste) {
                      if (!dataC[startNew.rowIndex][endNew.columnIndex]) {
                        // 超出最大列
                        return;
                      }
                      additions.push({
                        id: additionsId,
                        cell: { cellType: dataC[startNew.rowIndex][endNew.columnIndex].cellType },
                        row: endNew.rowIndex,
                        col: endNew.columnIndex,
                        value,
                      });
                    }
                  } else {
                    // 存在粘入数据使read only 发生 变化,外面限制即可
                    // else if (!cell.readOnly) {
                    additionsId = 0;
                    changes.push({ id: cell.id, cell, row: endNew.rowIndex, col: endNew.columnIndex, value });
                  }
                });
              }
            });
          }

          if (additions.length) {
            onCellsChanged(changes, additions);
          } else {
            onCellsChanged(changes);
          }
          // } else if (onPaste) {
          //   pasteData.forEach((row, i) => {
          //     if (!(i === pasteData.length - 1 && row.length === 1 && row[0] === '')) {
          //       const rowData = [];
          //       row.forEach((pastedData, j) => {
          //         end = { i: start.i + i, j: start.j + j };
          //         const cell = dataC[end.i] && dataC[end.i][end.j];
          //         rowData.push({ cell: cell, dataC: pastedData });
          //       });
          //       changes.push(rowData);
          //     }
          //   });
          //   onPaste(changes);
          // } else if (onChange) {
          //   pasteData.forEach((row: string[], i: number) => {
          //     if (!(i === pasteData.length - 1 && row.length === 1 && row[0] === '')) {
          //       row.forEach((value, j) => {
          //         endNew = { rowIndex: startNew.rowIndex + i, columnIndex: startNew.columnIndex + j };
          //         const cell = dataC[endNew.rowIndex] && dataC[endNew.rowIndex][endNew.columnIndex];
          //         if (cell && !cell.readOnly) {
          //           onChange(cell, endNew.rowIndex, endNew.columnIndex, value);
          //         }
          //       });
          //     }
          //   });
        }
        updateState({ end: endNew });
      }
    },
    [onCellsChanged]
  );

  const handleCut = useCallback(
    (e: Event) => {
      const { editing: editingC, start: startC, end: endC } = cachedData.current;
      if (isEmpty(editingC)) {
        e.preventDefault();
        handleCopy(e as unknown as ClipboardEvent);
        clearSelectedCells(startC, endC);
      }
    },
    [handleCopy, clearSelectedCells]
  );

  const handleIEClipboardEvents = useCallback(
    (e: KeyboardEvent) => {
      const { ctrlKey, which, keyCode } = e;
      const keyId = which || keyCode;
      if (ctrlKey) {
        if (keyId === 67) {
          // C - copy
          handleCopy(e as unknown as ClipboardEvent);
        } else if (keyId === 88) {
          // X - cut
          handleCut(e);
        } else if (keyId === 86) {
          // P - patse
          handlePaste(e as unknown as ClipboardEvent);
        }
      }
    },
    [handleCopy, handleCut, handlePaste]
  );

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIE = /MSIE|Trident/.test(ua);
    if (isIE) {
      document.addEventListener('keydown', handleIEClipboardEvents);
    }
    return () => {
      if (isIE) {
        document.removeEventListener('keydown', handleIEClipboardEvents);
      }
    };
  }, [handleIEClipboardEvents]);

  useEffect(() => {
    document.addEventListener('cut', handleCut);
    return () => {
      document.removeEventListener('cut', handleCut);
    };
  }, [handleCut]);

  useEffect(() => {
    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, [handleCut]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleCut]);

  return { handleKeyboardCellMovement, handleNavigate };
};

export default useEventHandler;
