/* eslint-disable max-len */
declare namespace ExcelTableType {
  type CellValue =
    | number
    | string
    | undefined
    | null
    | boolean
    | (string | number)[];

  type OperateType = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1:操作的复制；2、分段；3:添加；4: 删除；5:粘贴和添加;6:更新;7:自定义
  type StepInfosType = {
    id: string | number;
    value?: string;
    row: number;
    col?: number;
    field?: string;
    extra?: unknown;
    collapsed?: boolean[];
    totalCollapsed?: boolean;
  }[];

  type OperateInfos = {
    row?: number;
    infos?: StepInfosType;
    customInfos?: any;
    newIds?: number[];
    originData?: unknown;
  };

  interface OperateCollectInnerType {
    (infos: StepInfosType, removeIds?: number[]): void;
  }
  interface OperateCollectType {
    (type: OperateType, row?: number): OperateCollectInnerType;
  }

  type FocusControl = {
    focusCell?: (
      st: DataSheetType.cellPosition,
      ed: DataSheetType.cellPosition,
    ) => void;
  };

  type OperateCollector = (
    type: ExcelTableType.OperateType,
    operateInfo: ExcelTableType.OperateInfos,
  ) => void;

  type StepInfoCollect = {
    type: OperateType;
    operateInfos: OperateInfos;
    ids?: number[];
  };

  type Cell = {
    readOnly: boolean;
    key: string;
    id: string;
    className: string;
    component: (rest: any[]) => React.ReactNode;
    forceComponent: boolean;
    disableEvents: boolean;
    disableUpdatedFlag: boolean;
    colSpan: number;
    rowSpan: number;
    width: number | string;
    value: number | string;
    overflow: 'wrap' | 'nowrap' | 'clip';
    dataEditor: (rest: any[]) => React.ReactNode;
    valueViewer: (rest: any[]) => React.ReactNode;
  };

  type DateEditorPropsType = {
    value: CellValue;
    row: number;
    col: number;
    cell: Partial<Cell>;
    onChange: (value: CellValue) => void;
    onCommit: (value: CellValue, event: KeyboardEvent) => void;
    onRevert: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
  };

  type CellType =
    | 'text'
    | 'number'
    | 'select'
    | 'cascader'
    | 'date'
    | 'operate';

  type RecordData<T = Record<string, unknown>> = Record<string, CellValue> & {
    id: number;
  } & {
    children?: any;
  } & T;

  type OptionsType = Common.Options<{
    disabled?: boolean;
    children?: Common.Option<{
      children?: Common.Options<Record<string, unknown>>;
    }>;
  }>;

  type ColumnsType = {
    title: string | React.ReactNode; // to show in the header of table
    dataIndex: string; // the key of getting value from listStyle
    width: number | string; // the width of the column
    cellType: CellType; // cell type for render cell component
    readOnly?: boolean; // set column to be read only, default: false
    isSegmentTitle?: boolean; // title 作为分段开关
    calcReadOnly?: (
      record: RecordData,
      rowIndex: number,
      colIndex: number,
    ) => boolean; // the result will be readOnly, but more priority than readOnly
    dataEditor?: (rest: DateEditorPropsType<CellValue>) => React.ReactNode; // the return value will  show as cell component, when editing
    options?: OptionsType[]; // when cellType is select, options/getSelectOptions is required
    getSelectOptions?: (record: RecordData) => OptionsType[]; // when cellType is select, options/getSelectOptions is required, more priority than options
    valueViewer?: (rest: DateEditorPropsType<CellValue>) => React.ReactNode; // transfer value to show on cell, it will not change cell`s value
    cellClassName?: string; // cell class name
    calcCellClassName?: (record: RecordData) => string; // to set a className for td, more priority than cellClassName
    headerCellClassName?: string; // to set a className for header td
    component?: (
      record: RecordData,
      rowIndex: number,
      colIndex: number,
      operateInfosCollect?: OperateCollector,
    ) => React.ReactNode; // component for cell, all the time
    addonAfter?: string; // a suffix for input number
    min?: number; // the min data from input number
    max?: number; // the min data from input number
    calcRange?: (
      record: RecordData,
      rowIndex?: number,
      colIndex?: number,
    ) => { min?: number; max?: number };
    rangeWarningName?: string;
    calcRangeWarningName?: (
      record: RecordData,
      rowIndex?: number,
      colIndex?: number,
    ) => string;
    precision?: number;
    fillable?: boolean; // to set the cell fill function
    calcFillable?: (
      record: RecordData,
      rowIndex: number,
      colIndex: number,
    ) => boolean; // to calculate fillable of cell
    disabledDate?: (
      record: RecordData,
      rowIndex: number,
      colIndex: number,
    ) => (currentDate: Moment) => boolean;
    selectExtra?: (record: RecordData) => React.ReactNode;
    optionsLabelAlign?: 'left' | 'right';
  };

  type HeaderColumn = Pick<
    ColumnsType,
    'width' | 'dataIndex' | 'headerCellClassName' | 'isSegmentTitle'
  > & {
    label: ColumnsType[title];
  };

  type CellKeyInfo = {
    id: number;
    parentId?: number;
    row: number;
    col: number;
    field: string;
    value: ExcelTableType.CellValue;
    extra?: unknown;
  };
  type ExcelTableChange = (
    changeData: CellKeyInfo[],
    handleChangeSuccess: (
      oldData?: RecordData[],
      newData?: RecordData[],
    ) => void,
    withDrawConfig?: {
      type: OperateType;
      hasNewLine?: boolean;
      ids?: unknown[];
      oldData?: unknown;
    },
  ) => void;
  type withDrawCollector = { collectCustomOperate: (value: unknown) => void };
  type ExcelTableProps = {
    withDrawRef?: React.MutableRefObject<withDrawCollector | undefined>;
    data: RecordData[];
    columns: ColumnsType[];
    theme?: Record<string, string>;
    onChange?: ExcelTableChange;
    scroll?: { y: number };
    overScanRowCount?: number;
    rowHeight?: number;
    freePaste?: boolean;
    unlimitedPaste?: boolean;
    collapsed?: boolean;
    handleFill?: (type: 1 | 2 | 3, cellInfo: CellKeyInfo) => void;
    errorRowsIndex?: number[];
    handleAdd?: (callback?: any) => void;
    handleCollapse?: (value?: boolean, part?: boolean[]) => void;
    showExpand?: boolean;
    defaultCollapsed?: boolean;
    rowClassName?: (rowData: any, rowIndex: number) => string;
  };

  type Grid = Pick<
    ColumnsType<CellValue>,
    | 'id'
    | 'width'
    | 'readOnly'
    | 'dataEditor'
    | 'valueViewer'
    | 'cellType'
    | 'addonAfter'
    | 'min'
    | 'max'
    | 'fillable'
    | 'precision'
    | 'rangeWarningName'
  > & {
    key: string;
    value: CellValue;
    className?: string;
    forceComponent: boolean;
    component?: React.ReactNode;
  };

  type ChangeCellData = {
    id: string;
    cell: Grid;
    row: number;
    col: number;
    value: CellValue;
  };
}
