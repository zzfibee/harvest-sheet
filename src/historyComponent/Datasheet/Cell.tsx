import React, { useEffect, useMemo, useRef, useState } from 'react';

import { curry } from 'lodash';
import DataEditor from './DataEditor';
import DefaultCell from './DefaultCell';
import {
  DOWN_KEY,
  ENTER_KEY,
  ESCAPE_KEY,
  LEFT_KEY,
  renderValue,
  RIGHT_KEY,
  TAB_KEY,
  UP_KEY,
} from './helper';
import ValueViewer from './ValueViewer';

function initialData({ cell, row, column }: DataSheetType.CellProps) {
  return renderValue(cell, row, column);
}

function widthStyle(cell: DataSheetType.Cell) {
  const width =
    typeof cell?.width === 'number' ? `${cell.width}px` : cell.width;
  return width ? { width } : null;
}

const Cell = (props: DataSheetType.CellProps) => {
  const {
    row,
    column,
    cell,
    cellRenderer: CellRenderer = DefaultCell,
    dataEditor,
    valueViewer,
    attributesRenderer,
    selected,
    isEditingNow,
    clearing,
    onChange,
    onNavigate,
    onRevert,
    onMouseDown,
    onMouseOver,
    onDoubleClick,
    onContextMenu,
  } = props;

  const [reverting, setReverting] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [value, setValue] = useState(clearing ? '' : initialData(props));
  const valueRef = useRef<any>(value);

  const timeoutRef = useRef<null | any>(null);
  const currentVal = initialData(props);

  useEffect(() => {
    const initVal = initialData(props);
    const val = clearing ? '' : initVal;
    if (isEditingNow) {
      console.log('effect_setValue', val);
      setValue(val);
      valueRef.current = val;
      setReverting(false);
    } else if (!reverting && !committing && value !== initVal) {
      onChange(row, column, value);
    }
  }, [isEditingNow]);

  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    [],
  );

  const handleChange = (val: string) => {
    setValue(val);
    console.log('handleChange_setValue', val);
    valueRef.current = val;
    setCommitting(false);
  };

  const handleRevert = () => {
    setReverting(true);
    onRevert();
  };

  const handleCommit = (val: string, e: any) => {
    if (val !== currentVal) {
      setValue(val);
      console.log('handleCommit_setValue', val);
      valueRef.current = val;
      setCommitting(true);
      onChange(row, column, val);
    } else {
      handleRevert();
    }
    if (e) {
      e.preventDefault();
      onNavigate(e, true);
    }
  };

  const EventHandle = curry(
    (fuc: (row: number, col: number, e: any) => void, e: any) => {
      if (!cell.disableEvents) {
        fuc(row, column, e);
        // if (valueRef.current !== currentVal) {
        //   setValue(currentVal);
        //   valueRef.current = currentVal;
        // }
      }
    },
  );

  const handleKey = (e: any) => {
    const keyCode = e.which || e.keyCode;
    if (keyCode === ESCAPE_KEY) {
      handleRevert();
      return;
    }
    const commit =
      keyCode === ENTER_KEY ||
      keyCode === TAB_KEY ||
      [LEFT_KEY, RIGHT_KEY, UP_KEY, DOWN_KEY].includes(keyCode);

    if (commit) {
      handleCommit(value, e);
    }
  };

  const renderComponent = (isEditing: boolean, cl: DataSheetType.Cell) => {
    const { component, readOnly, forceComponent } = cl;
    if ((isEditing && !readOnly) || forceComponent) {
      return component;
    }
    return '';
  };

  const renderEditor = (
    isEditing: boolean,
    cel: DataSheetType.Cell,
    r: number,
    col: number,
    editor: any,
  ) => {
    if (isEditing) {
      const Editor = cel.dataEditor || editor || DataEditor;
      console.log('renderEditor', value);
      return (
        <Editor
          cell={cel}
          row={r}
          col={col}
          value={value}
          onChange={handleChange}
          onCommit={handleCommit}
          onRevert={handleRevert}
          onKeyDown={handleKey}
        />
      );
    }
    return null;
  };

  const renderViewer = (
    cel: DataSheetType.Cell,
    r: number,
    col: number,
    valViewer: React.ElementType,
  ) => {
    const Viewer = cell.valueViewer || valViewer || ValueViewer;
    const val = renderValue(cell, row, col);
    return <Viewer cell={cell} row={row} col={col} value={val} />;
  };

  const content =
    renderComponent(isEditingNow, cell) ||
    renderEditor(isEditingNow, cell, row, column, dataEditor) ||
    renderViewer(cell, row, column, valueViewer);

  const className = useMemo(
    () =>
      [
        cell.className,
        'cell',
        selected && 'selected',
        isEditingNow && 'editing',
        cell.readOnly && 'read-only',
      ]
        .filter((a) => a)
        .join(' '),
    [isEditingNow, selected, cell.className, cell.readOnly],
  );

  return (
    <CellRenderer
      row={row}
      column={column}
      cell={cell}
      selected={selected}
      editing={isEditingNow}
      attributesRenderer={attributesRenderer}
      className={className}
      style={widthStyle(cell)}
      onMouseDown={EventHandle(onMouseDown)}
      onMouseOver={EventHandle(onMouseOver)}
      onDoubleClick={EventHandle(onDoubleClick)}
      onContextMenu={EventHandle(onContextMenu)}
    >
      {content}
    </CellRenderer>
  );
};

export default Cell;
