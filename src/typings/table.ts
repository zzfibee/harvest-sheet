declare namespace Table {
  type refAssertion = {
    contains?: (target: EventTarget | null) => boolean;
    focus?: () => boolean;
  } & HTMLTableSectionElement;

  type CellAlign = 'left' | 'right' | 'center';
  type CellFixed = 'left' | 'right';

  type ColumnProps = {
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
    render?: Sheet.CellViewer;
    editor?: Sheet.CellEditor;
  };
  type TableChange = {
    row: number;
    id: string;
    key: string;
    value: unknown;
  };
  type TableRowSelection = {
    onChange: (
      selectedRowKeys: string[],
      selectedRows: Record<string, unknown>[],
    ) => void;
  };
  type TableGroupConfig = {
    defaultOpen: boolean;
  };
  type TableProps = {
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
  };
}
