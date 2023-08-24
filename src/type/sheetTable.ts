import { SheetType } from '.';

export type refAssertion = {
  contains?: (target: EventTarget | null) => boolean;
  focus?: () => boolean;
} & HTMLTableSectionElement;

export type CellAlign = 'left' | 'right' | 'center';
export type CellFixed = 'left' | 'right';

export type ColumnProps = {
  align?: CellAlign;
  fixed?: CellFixed;
  width?: string | number;
  dataIndex?: string;
  title: string;
  key?: string;
  editable?: boolean;
  readonly?:
    | boolean
    | ((
        value: unknown,
        record: Record<string, unknown>,
        index: number,
      ) => boolean);
  render?: SheetType.CellViewer;
  editor?: SheetType.CellEditor;
};
export type TableChange = {
  row: number;
  id: string;
  key: string;
  value: unknown;
};
export type TableRowSelection = {
  onChange: (
    selectedRowKeys: string[],
    selectedRows: Record<string, unknown>[],
  ) => void;
};
export type TableGroupConfig = {
  defaultOpen: boolean;
};
export type TableProps = {
  className?: string;
  columns: ColumnProps[];
  virtualized?: boolean;
  dataSource: Record<string, unknown>[];
  rowClassName?:
    | string
    | ((record: Record<string, unknown>, index: number) => string);
  rowKey?:
    | string
    | ((record: Record<string, unknown>, index: number) => string);
  scroll?: { x?: number | string; y?: number | string };
  sticky?: boolean;
  draggable?: boolean;
  rowSelection?: {
    rowSelected: string[];
    onChange: (
      selectedRowKeys: string[],
      selectedRows: Record<string, unknown>[],
    ) => void;
  };
  groupConfig?: {
    rowGroup: TableGroupConfig;
    onChange: (value: TableGroupConfig) => void;
  };

  onChange: (changes: TableChange[]) => void;
  eventHandler?: Record<
    'btn-click' | 'cell-edit' | 'cell-switch' | string,
    undefined | ((value: unknown) => void)
  >;
};
