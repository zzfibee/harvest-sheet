import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import Cell from './Cell';

const useCell = (
  props: DataSheetType.SheetProps,
  cachedData: { current: DataSheetType.UpdateStateType },
  updateState: (state: Partial<DataSheetType.UpdateStateType>) => void,
  onRevert: () => void,
  onContextMenu?: (
    evt: any,
    cell: DataSheetType.Cell,
    row: number,
    column: number,
  ) => void,
) => {
  const {
    onCellsChanged,
    onChange,
    attributesRenderer,
    cellRenderer,
    valueViewer,
    dataEditor,
  } = props;
  const isEditing = (row: number, col: number) => {
    const { rowIndex, columnIndex } = cachedData.current.editing;
    return rowIndex === row && columnIndex === col;
  };

  const isClearing = (row: number, col: number) => {
    const { rowIndex, columnIndex } = cachedData.current.clear;
    return rowIndex === row && columnIndex === col;
  };

  const onMouseDown = (row: number, col: number, event: MouseEvent) => {
    const {
      start: startC,
      editing: editingC,
      editing: { rowIndex, columnIndex },
    } = cachedData.current;
    const isNotEditing = isEmpty(editingC);
    const isNowEditingSameCell =
      !isNotEditing && rowIndex === row && columnIndex === col;

    const editingInfo =
      isNotEditing || rowIndex !== row || columnIndex !== col ? {} : editingC;

    updateState({
      selecting: !isNowEditingSameCell,
      start: event.shiftKey ? startC : { rowIndex: row, columnIndex: col },
      end: { rowIndex: row, columnIndex: col },
      editing: editingInfo,
      forceEdit: !!isNowEditingSameCell,
    });
    // eslint-disable-next-line no-param-reassign
    cachedData.current.mouseDown = true;
  };

  const handleContextMenu = useCallback(
    (row: number, column: number, evt: any) => {
      const cell = cachedData.current.data[row][column];
      if (onContextMenu) {
        onContextMenu(evt, cell, row, column);
      }
    },
    [onContextMenu],
  );

  const onDoubleClick = (row: number, column: number) => {
    const cell = cachedData.current.data[row][column];
    if (!cell.readOnly) {
      updateState({
        editing: { rowIndex: row, columnIndex: column },
        forceEdit: true,
        clear: {},
      });
    }
  };

  const onMouseOver = (row: number, column: number) => {
    const {
      mouseDown,
      selecting: selectingC,
      editing: editingC,
    } = cachedData.current;
    if (mouseDown && selectingC && isEmpty(editingC)) {
      updateState({ end: { rowIndex: row, columnIndex: column } });
    }
  };

  const isSelected = (row: number, col: number) => {
    const {
      start: { rowIndex: rowIndexST, columnIndex: columnIndexST },
      end: { rowIndex, columnIndex },
      lastFocus,
      data: d,
    } = cachedData.current;

    if (
      rowIndexST === undefined ||
      rowIndex === undefined ||
      columnIndex === undefined ||
      columnIndexST === undefined
    ) {
      const { id } = d[row][col];

      return lastFocus.some((item) => item.id === id && item.column === col);
    }

    const posX = col >= columnIndexST && col <= columnIndex;
    const negX = col <= columnIndexST && col >= columnIndex;
    const posY = row >= rowIndexST && row <= rowIndex;
    const negY = row <= rowIndexST && row >= rowIndex;

    return (posX && posY) || (negX && posY) || (negX && negY) || (posX && negY);
  };

  const handleChange = useCallback(
    (row: number, col: number, value: string) => {
      const { data: dataC } = cachedData.current;
      if (onCellsChanged) {
        onCellsChanged([
          { id: dataC[row][col].id, cell: dataC[row][col], row, col, value },
        ]);
      } else if (onChange) {
        onChange(dataC[row][col], row, col, value);
      }
      onRevert();
    },
    [onCellsChanged, onChange],
  );

  const renderCell = useCallback(
    (
      rowData: DataSheetType.Cell[],
      rowIndex: number,
      handleKeyboardCellMovement: any,
    ) => {
      const cls = rowData.map((cell, columnIndex) => {
        const isEditingNow = isEditing(rowIndex, columnIndex);

        return (
          <Cell
            key={columnIndex}
            row={rowIndex}
            column={columnIndex}
            cell={cell}
            onMouseDown={onMouseDown}
            onMouseOver={onMouseOver}
            onDoubleClick={onDoubleClick}
            onContextMenu={handleContextMenu}
            onChange={handleChange}
            onRevert={onRevert}
            onNavigate={handleKeyboardCellMovement}
            selected={isSelected(rowIndex, columnIndex)}
            isEditingNow={isEditingNow}
            clearing={isClearing(rowIndex, columnIndex)}
            attributesRenderer={attributesRenderer}
            cellRenderer={cellRenderer}
            valueViewer={valueViewer}
            dataEditor={dataEditor}
          />
        );
      });

      return cls;
    },
    [handleContextMenu, handleChange, attributesRenderer, cellRenderer],
  );

  return renderCell;
};

export default useCell;
