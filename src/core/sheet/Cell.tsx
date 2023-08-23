import type { SheetType } from '@zhenliang/sheet/type';
import { isNil } from 'lodash';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSetState, useSheetEvent } from '../../hooks';
import { renderValue } from '../util';
import DataEditor from './DataEditor';
import DefaultCell from './DefaultCell';
import ValueViewer from './ValueViewer';

type EventInfo = {
  selected: boolean;
  value?: string;
  editing: boolean;
};
function initialData({ cell }: SheetType.CellProps) {
  return renderValue(cell);
}

function widthStyle(cell: SheetType.Cell) {
  const width =
    typeof cell?.width === 'number' ? `${cell.width}px` : cell.width;
  const align = cell.align || 'left';
  const position = cell.fixed ? 'sticky' : 'unset';
  const left = cell.fixed === 'left' ? 0 : 'unset';
  const right = cell.fixed === 'right' ? 0 : 'unset';
  return { width, textAlign: align, position, left, right };
}

const Cell = (props: SheetType.CellProps) => {
  const {
    row,
    col,
    cell,
    cellRenderer: CellRenderer = DefaultCell,
    dataEditor,
    valueViewer,
    attributesRenderer,
  } = props;

  const eventBus = useSheetEvent();
  const [eventState, setEventState] = useSetState<{
    selected: boolean;
    selectedInfo?: {
      isStart?: boolean;
      isTop?: boolean;
      isBottom?: boolean;
      isLeft?: boolean;
      isRight?: boolean;
    };
    editing?: boolean;
    confirm?: boolean;
  }>();
  const { selected, selectedInfo, editing, confirm } = eventState;

  const [value, setValue] = useState(initialData(props));
  const valueRef = useRef<any>(value);

  useEffect(() => {
    const newValue = renderValue(cell);
    setValue(newValue);
    valueRef.current = newValue;
  }, [cell, row, col]);

  useEffect(() => {
    if (isNil(row) || isNil(col) || !eventBus) {
      return;
    }
    const onCellState = (eventInfo: EventInfo) => {
      if (eventInfo.value && eventInfo.editing) {
        setValue(eventInfo.value);
      }
      setEventState(eventInfo);
    };

    eventBus.on(`cell-${row}-${col}-change`, onCellState);
    eventBus.emit(`cell-create`, { row, col });
    return () => {
      eventBus.off(`cell-${row}-${col}-change`, onCellState);
    };
  }, [eventBus, row, col]);

  useEffect(() => {
    if (isNil(row) || isNil(col) || !eventBus) {
      return;
    }
    if (confirm) {
      setEventState({ confirm: false });
      if (value !== valueRef.current) {
        console.log('confirm omit');
        eventBus.emit('cell-change', { row, col: col, value });
      }
    }
  }, [confirm, eventBus, value]);

  const handleCommit = useCallback(
    (value: string) => {
      if (valueRef.current === value) {
        return;
      }
      setValue(value);
      console.log('handle omit');
      eventBus.emit('cell-change', { row, col: col, value, confirm: true });
    },
    [eventBus, valueRef],
  );

  const renderEditor = (
    cel: SheetType.Cell,
    r: number,
    col: number,
    editor: any,
    isEditing?: boolean,
  ) => {
    if (isEditing) {
      const Editor = cel.dataEditor || editor || DataEditor;
      return (
        <Editor
          cell={cel}
          row={r}
          col={col}
          value={value}
          onConfirm={handleCommit}
          onChange={setValue}
        />
      );
    }
    return null;
  };

  const renderViewer = (
    cel: SheetType.Cell,
    r: number,
    col: number,
    valViewer?: React.ElementType,
  ) => {
    const Viewer = cell.valueViewer || valViewer || ValueViewer;
    const val = renderValue(cell);

    return (
      <Viewer
        record={cell.record}
        cell={cell}
        row={row}
        col={col}
        value={val}
      />
    );
  };

  const content =
    (cell.editable ?? true) && editing
      ? renderEditor(cell, row, col, dataEditor, editing)
      : renderViewer(cell, row, col, valueViewer);

  const className = useMemo(
    () =>
      [
        cell.className,
        'cell',
        selected && 'selected',
        selectedInfo?.isStart && 'selected-start',
        selectedInfo?.isBottom && 'selected-bottom',
        selectedInfo?.isTop && 'selected-top',
        selectedInfo?.isLeft && 'selected-left',
        selectedInfo?.isRight && 'selected-right',
        editing && 'editing',
        cell.readonly && 'read-only',
      ]
        .filter((a) => a)
        .join(' '),
    [editing, selected, selectedInfo, cell.className, cell.readonly],
  );

  return (
    <CellRenderer
      row={row}
      col={col}
      cell={cell}
      selected={eventState.selected}
      editing={eventState.editing}
      attributesRenderer={attributesRenderer}
      className={className}
      style={widthStyle(cell)}
    >
      {content}
    </CellRenderer>
  );
};

export default memo(Cell, (pre, next) => {
  const shouldUpdate =
    pre.col === next.col &&
    pre.row === next.row &&
    pre.cell.value === next.cell.value &&
    pre.cell.record === next.cell.record;
  return shouldUpdate;
});
