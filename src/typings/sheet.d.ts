declare namespace Sheet {
  type Cell = {
    id: string;
    key?: string;
    readonly?: boolean;
    component?: CellViewer;
    editable?: boolean;
    colSpan?: number;
    rowSpan?: number;
    width?: number;
    record?: Record<string, unknown>;
    disableEvents?: boolean;
    dataEditor?: CellEditor;
    valueViewer?: CellViewer;
    className?: string;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    value?: string | number | null;
  };

  type CellEditorProps = {
    value: unknown;
    cell?: Cell;
    onChange: (value) => void;
    onConfirm: (value) => void;
  };

  type CellViewerProps = {
    value: unknown;
    record?: Record<string, unknown>;
    row: number;
    col: number;
    cell?: Cell;
  };

  type CellEditor = React.FC<CellEditorProps> & {
    checker?: (value: unknown) => boolean;
    formatter?: (value: unknown) => unknown;
  };
  type CellViewer = React.FC<CellViewerProps>;

  type CellPosition = {
    row: number;
    col: number;
  };

  type CellData = {
    id: string;
    cell: Cell;
    row: number;
    col: number;
    value?: string;
  };

  type CellNavigable = (cell?: Cell, row?: number, col?: number) => boolean;
  type CellChangeHandler = (cells: CellData[], additions?: CellData[]) => void;

  type RowGroup = {
    groupName: string;
    groupStart: number;
    groupEnd: number;
  };
  type RowGroupConfig = {
    groups: RowGroup[];
    groupOpen: boolean[];
  };
  type MenuRenderProps = {
    position?: { top: number; left: number };
    cell?: Sheet.CellPosition;
    onContextMenu?: (event: any) => void;
  };

  type SheetInstance = {
    zoomTo: (row?: number) => void;
    pushToHistory: (value: OperateHistory) => void;
    selectRow: (row?: number) => void;
    popHistory: () => OperateHistory;
  };

  type SheetProps = {
    sheetInstance?: React.MutableRefObject<Sheet.SheetInstance | null>;
    sheetRenderer?: any;
    rowRenderer?: any;
    className?: string;
    data: Cell[][];
    freePaste?: boolean;
    virtualized?: boolean;

    groupConfig?: RowGroupConfig;

    onCellsChanged?: CellChangeHandler;
    menuRenderer?: React.FC<MenuRenderProps>;
    onContextMenu?: (event: any) => void;

    scroll?: { x?: number | string; y?: number | string };
    rowClassName?:
      | string
      | ((record: Record<string, unknown>, index: number) => string);
    children?: (React.Element | null)[];
  };

  type SheetShell = Pick<SheetTable.TableProps, 'columns'> & {
    className?: string;
    showGroup?: boolean;
    showSelect?: boolean;
    controlWidth?: number;
    controlProps?: {
      check?: {
        checked: boolean;
        indeterminate?: boolean;
      };
      group?: {
        open: boolean;
      };
    };
  };

  type SheetRow = {
    row: number;
    cells: Cell[];
    selected: boolean;
    children: React.ElementType;
  };

  // todo
  type windowAssertion = {
    clipboardData?: {
      getData?: (type: string) => string;
      setData?: (type: string, data: string) => string;
    };
  };

  type refAssertion = {
    contains?: (target: EventTarget | null) => boolean;
    focus?: () => boolean;
  } & HTMLSpanElement;

  type AttributesRenderer = (
    cell: Sheet.Cell,
    row: number,
    col: number,
  ) => Record<string, string>;

  type CellProps = {
    row: number;
    col: number;
    cell: Cell;
    cellRenderer?: React.ElementType;
    dataEditor?: React.ElementType;
    valueViewer?: React.ElementType;
    attributesRenderer?: AttributesRenderer;
  };

  type UpdateStateType = {
    eventBus: EventEmitter;
    start: Sheet.CellPosition;
    end: Sheet.CellPosition;
    selecting: boolean;
    forceEdit: boolean;
    clear: CellPosition;
    editing: CellPosition & { value?: string };
    history: OperateHistory[];
    freePaste?: boolean;
    data: Cell[][];
    mouseDown: boolean;
    lastSelected?: { start?: Sheet.CellPosition; end?: Sheet.CellPosition };
    groupConfig?: {
      groups: RowGroup[];
      groupOpen: boolean[];
    };
    lastFocus: { id: string; col: number }[];
    lastEditing: CellPosition & { confirm?: boolean };
    cellChangeHandler: (cells: CellData[], additions?: CellData[]) => void;
  };
  type UpdateFocus = (start: CellPosition, end: CellPosition) => void;

  type Options<T> = {
    value: string;
    label: string;
  } & T;

  type OptionsType = Options<{
    disabled?: boolean;
    children?: Common.Option<{
      children?: Common.Options<Record<string, unknown>>;
    }>;
  }>;

  type OperateHistory = {
    changes: Partial<CellData>[];
    type: OperateType;

    rowInfo?: {
      newRow?: number;
      deleteRow?: number;
    };
    extraInfo?: Record<string, unknown>;
  };

  type OperateType =
    // 前三个Type 直接调用 onCellChange
    | 'Edit'
    | 'Paste'
    | 'Delete'
    // 后三个单独Event 处理
    | 'DeleteRow'
    | 'NewRow'
    | 'Custom';
}
