import { ReactNode } from 'react';
import { SheetType } from '.';

export type refAssertion = {
  contains?: (target: EventTarget | null) => boolean;
  focus?: () => boolean;
} & HTMLTableSectionElement;

export type CellFixed = SheetType.CellAlign;

export type ColumnProps = {
  /**
   * @description 对齐
   * @default "left"
   */
  align?: SheetType.CellAlign;
  /**
   * @description 固定
   * @default "undefined"
   */
  fixed?: Omit<CellFixed, 'center'>;
  /**
   * @description 列宽
   * @default "undefined"
   */
  width?: string | number;
  dataIndex?: string;
  title: string | ReactNode | ReactNode[];
  titleConfig?: {
    colSpan?: number;
    className?: string;
  };
  cellConfig?: {
    className?: string;
  };
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
export type EventHandler = (value: any) => void;
export type TableProps = {
  /**
   * @description 表格类名
   * @default "undefined"
   */
  className?: string;
  /**
   * @description sheet的一些定义方法可执行
   * @default "object"
   */
  sheetInstance?: React.MutableRefObject<SheetType.SheetInstance | null>;
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
  freePaste?: boolean;
  rowSelection?: {
    rowSelected: string[];
    onChange: (
      selectedRowKeys: string[],
      selectedRows: Record<string, unknown>[],
    ) => void;
  };
  groupConfig?: {
    defaultOpen?: boolean;
    rowGroup: TableGroupConfig;
    onChange: (value: TableGroupConfig) => void;
  };

  onChange: (changes: TableChange[], extChanges?: TableChange[]) => void;
  handleAdd?: () => void;
  eventHandler?: Record<
    'reverse' | 'btn-click' | 'cell-edit' | 'cell-switch' | string,
    undefined | EventHandler
  >;
};
