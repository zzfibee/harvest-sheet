declare namespace DataSheetType {
  type Cell = {
    id: string;
    cellType: string;
    key?: string;
    readOnly?: boolean;
    component?: React.ReactNode;
    forceComponent?: boolean;
    colSpan: number;
    rowSpan: number;
    width?: number;
    disableEvents?: boolean;
    dataEditor?: React.ElementType;
    valueViewer?: React.ElementType;
    className?: string;
    value?: string | null;
  };

  type cellPosition = {
    rowIndex: number;
    colIndex: number;
  };

  type cellData = {
    id: string;
    cell?: Cell;
    row: number;
    col: number;
    value?: string;
  };

  type CellNavigable = (cell?: Cell, row?: number, column?: number) => boolean;

  type SheetProps = {
    sheetRenderer?: any;
    rowRenderer?: any;
    cellRenderer?: any;
    dataEditor?: any;
    valueViewer?: any;
    attributesRenderer?: any;
    className?: string;
    data: Cell[][];
    freePaste?: boolean;
    disablePageClick?: boolean;
    onChange?: (
      cell: Cell,
      rowIndex: number,
      columnIndex: number,
      value: any,
    ) => void;
    onCellsChanged?: (cells: cellData[], additions?: cellData[]) => void;
    isCellNavigable?: CellNavigable;
    onContextMenu?: (
      event: any,
      cell: Cell,
      rowIndex: number,
      columnIndex: number,
    ) => void;
    handleBack?: () => void;
    onRecover?: () => void;
    rowClassName?: (rowData: any, rowIndex: number) => string;
  };

  type SheetShell = Pick<SheetProps, 'className' | 'data'> & {
    children: React.ElementType;
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
    cell: DataSheetType.Cell,
    row: number,
    col: number,
  ) => Record<string, string>;
  type CellProps = {
    row: number;
    column: number;
    cell: Cell;
    cellRenderer?: React.ElementType;
    dataEditor?: React.ElementType;
    valueViewer?: React.ElementType;
    attributesRenderer?: AttributesRenderer;
    selected?: boolean;
    isEditingNow?: boolean;
    clearing?: boolean;
    onChange?: (row: number, col: number, value: string) => void;
    onNavigate?: (e: any, committing: boolean) => void;
    onRevert?: () => void;
    // onMouseDown: (row: number, col: number, e: any) => void;
    onDoubleClick?: (row: number, col: number) => void;
    onMouseOver?: (row: number, col: number) => void;
    onContextMenu?: (row: number, col: number, e: any) => void;
  };

  type UpdateStateType = {
    eventBus: EventEmitter;
    start: DataSheetType.cellPosition;
    end: DataSheetType.cellPosition;
    lastSelected: {
      start?: DataSheetType.cellPosition;
      end?: DataSheetType.cellPosition;
    };
    selecting: boolean;
    forceEdit: boolean;
    clear: DataSheetType.cellPosition;
    editing: DataSheetType.cellPosition & { confirm?: boolean; value?: string };
    lastEditing: DataSheetType.cellPosition & { confirm?: boolean };
    data: DataSheetType.Cell[][];
    mouseDown: boolean;
    lastFocus: { id: string; column: number }[];
  };
  type UpdateFocus = (start: cellPosition, end: cellPosition) => void;
}
