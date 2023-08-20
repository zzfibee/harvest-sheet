import { message } from 'antd';

import {
  formatPrecision,
  thousandsSeparator,
} from '@harvest/sheet/standardUtils';

import { isEmpty, isNil } from 'lodash';
import cascaderEditor from './CascaderEditor';
import DatePickerEditor from './DatePickerEditor';
import InputNumber from './InputNumber';
import selectEditor from './SelectEditor';

const optionsFormat = (options: ExcelTableType.OptionsType[]) => {
  const optionsFormatted = options.map((option) => {
    const { label, children, disabled } = option;

    const optionFormatted = { label, value: label, children, disabled };
    if (children) {
      optionFormatted.children = optionsFormat(children);
    }

    return optionFormatted;
  });

  return optionsFormatted;
};

export const optionsTransferToValue = (
  options: ExcelTableType.OptionsType[],
  val: string,
) => {
  let values: string[] = [];

  for (let i = 0; i < options.length; i++) {
    const { label, value, children } = options[i];
    if (children) {
      values = optionsTransferToValue(children, val);
      if (values.length) {
        values = [value, ...values];
        break;
      }
    } else if (label === val) {
      values.push(value);
      break;
    } else {
      values = [];
    }
  }
  return values;
};

const optionsTransferToLabel = (
  options: ExcelTableType.OptionsType[],
  values?: (string | number)[],
) => {
  let currentOptions = options;
  let canTransfer = true;
  if (!values || !Array.isArray(values) || values.length === 0) {
    return undefined;
  }
  const valueTransfer = values.map((v) => {
    const option = currentOptions.find((co) => co.value === v);
    if (option) {
      const { label, children } = option;
      currentOptions = children;
      return label;
    }
    canTransfer = false;

    return null;
  });

  return canTransfer ? valueTransfer[valueTransfer.length - 1] : undefined;
};

const cascaderValueCheck = (
  options: ExcelTableType.OptionsType[],
  value: string,
) => {
  const canCopy = options.some((option) => {
    const { label, children } = option;
    if (!isEmpty(children)) {
      return cascaderValueCheck(children, value);
    }
    return label === value;
  });

  return canCopy;
};

const getOptions = (
  column: ExcelTableType.ColumnsType,
  record: ExcelTableType.RecordData,
) => {
  const { options: optionsOrigin, getSelectOptions } = column;
  const options =
    (getSelectOptions && getSelectOptions(record)) || optionsOrigin || [];
  return options;
};

const valueTrim = (value: ExcelTableType.CellValue) => {
  let pureValue = value;
  if (typeof pureValue === 'string') {
    pureValue = pureValue.trim();
  } else if (typeof pureValue === 'number') {
    pureValue = Number(String(pureValue).trim());
  }
  return pureValue;
};

export const numberRangeCheck = (
  changeData: ExcelTableType.ChangeCellData,
  showWarning = false,
) => {
  const {
    value,
    cell: { min, max, cellType, rangeWarningName },
  } = changeData;
  let formatVal = value;
  if (cellType === 'number') {
    let needWarning = false;
    if (min !== undefined && (formatVal as number) < min) {
      formatVal = min;
      needWarning = true;
    } else if (max !== undefined && (formatVal as number) > max) {
      formatVal = max;
      needWarning = true;
    }

    if (showWarning && needWarning) {
      message.error(`${rangeWarningName}范围是：${min} 至 ${max}`);
    }
  }

  return formatVal;
};

export const valueCheck = (
  data: ExcelTableType.RecordData[],
  originColumns: ExcelTableType.ColumnsType[],
  cellData: ExcelTableType.ChangeCellData,
) => {
  const {
    cell: { cellType },
    row,
    col,
    value,
  } = cellData;

  const pureValue = valueTrim(value);

  let canCopy = true;
  if (cellType === 'operate') {
    canCopy = false;
  } else if (pureValue === null || pureValue === '' || cellType === 'text') {
    canCopy = true;
  } else if (cellType === 'number') {
    // const numberReg = /\d+/g;
    // ^[-+]?\d{1,3}(,\d{3})*(\.(\d*))?$ 只匹配千分位符的数字
    // (^\d+$)  只匹配纯数字不带小数点
    // (^\d+(\.(\d*))?$) 只匹配带小数点的数字
    const numberReg =
      /^[-+]?\d{1,3}(,\d{3})*(\.(\d*))?$|(^\d+$)|(^\d+(\.(\d*))?$)/;
    canCopy = numberReg.test(String(pureValue));
  } else if (cellType === 'select') {
    const options = getOptions(originColumns[col], data[row]);
    canCopy = options.some((item) => item.label === pureValue);
  } else if (cellType === 'date') {
    const dateReg = /\d{4}(\/|-)[0,1]?\d{1}(\/|-)[0-3]?\d{1}/g;
    canCopy = dateReg.test(pureValue as string);
  } else if (cellType === 'cascader') {
    const options = getOptions(originColumns[col], data[row]);
    canCopy = cascaderValueCheck(options, pureValue as string);
  }
  return canCopy;
};

const emptyIdCalc = (() => {
  let offset = -1;
  return (changeId: string, id?: number) => {
    let finalId = String(id);
    if (id) {
      offset = -1;
    } else if (offset >= 0) {
      finalId = String(changeId + offset);
    } else {
      offset = -1 - Number(changeId);
      finalId = '-1';
    }

    return finalId;
  };
})();

export const changeTransfer = (
  data: ExcelTableType.RecordData[],
  originColumns: ExcelTableType.ColumnsType[],
  cellData: ExcelTableType.ChangeCellData,
) => {
  const { cell, row, col, value, id: changeId } = cellData;
  let valueTransfer = valueTrim(value);
  const { cellType } = cell;
  const { id } = data[row] || {};
  const { dataIndex } = originColumns[col];

  const finalId = emptyIdCalc(changeId, id);

  if (cellType === 'select') {
    const options = getOptions(originColumns[col], data[row]);
    const option = options.find((item) => item.label === valueTransfer);
    valueTransfer = isNil(option?.value) ? null : option?.value;
  } else if (cellType === 'cascader') {
    const options = getOptions(originColumns[col], data[row]);
    valueTransfer = optionsTransferToValue(options, valueTransfer as string);
  } else if (cellType === 'number' && typeof valueTransfer === 'string') {
    if (valueTransfer === '') {
      valueTransfer = null;
    } else {
      // 由于上面的正则不会让错误的数字cancopy值为ture，这里只要去掉逗号就好了
      valueTransfer = Number(valueTransfer.replace(/,/g, ''));
      valueTransfer = numberRangeCheck({ ...cellData, value: valueTransfer });
    }
  }
  return {
    field: dataIndex,
    value: valueTransfer,
    id: finalId,
    row,
    col,
    parentId: data[row]?.parentId as number,
  } as unknown as ExcelTableType.CellKeyInfo;
};

const getDataEditor = (
  column: ExcelTableType.ColumnsType,
  record: ExcelTableType.RecordData,
) => {
  const {
    cellType,
    dataEditor: dataEditorOrigin,
    selectExtra,
    optionsLabelAlign,
  } = column;
  let dataEditor = dataEditorOrigin;
  if (cellType === 'select') {
    let options = getOptions(column, record);
    options = optionsFormat(options);
    dataEditor = selectEditor(
      options,
      selectExtra && selectExtra(record),
      optionsLabelAlign,
    );
  } else if (cellType === 'cascader') {
    let options = getOptions(column, record);
    options = optionsFormat(options);
    dataEditor = cascaderEditor(options);
  } else if (cellType === 'date') {
    dataEditor = DatePickerEditor;
  } else if (cellType === 'number') {
    dataEditor = InputNumber;
  }

  return dataEditor;
};

const numberDataViewer = (props: {
  cell: ExcelTableType.Grid;
  value: ExcelTableType.CellValue;
}) => {
  const {
    value,
    cell: { addonAfter, precision, readOnly },
  } = props;
  let valueFormat = value;
  if (value !== '') {
    valueFormat = thousandsSeparator(
      formatPrecision(value as number, precision),
    );
    if (addonAfter) {
      valueFormat += addonAfter;
    }
  } else if (readOnly) {
    valueFormat = '-';
  }
  return (
    <span className="value-viewer number-value-viewer">{valueFormat}</span>
  );
};

const getDataViewer = (
  column: ExcelTableType.ColumnsType,
  record: ExcelTableType.RecordData,
) => {
  const { cellType, valueViewer: valueViewerOrigin } = column;

  let valueViewer:
    | ((props: {
        cell: ExcelTableType.Grid;
        value: ExcelTableType.CellValue;
      }) => React.ReactNode)
    | undefined = valueViewerOrigin;

  if (valueViewer) {
    valueViewer = valueViewer.bind({ column, record });
  } else if (cellType === 'number') {
    valueViewer = numberDataViewer;
  }

  return valueViewer;
};

const getCellClassName = (
  column: ExcelTableType.ColumnsType,
  record: ExcelTableType.RecordData,
) => {
  const {
    calcCellClassName,
    cellType,
    cellClassName: cellClassNameOrigin,
  } = column;
  let cellClassName =
    (calcCellClassName && calcCellClassName(record)) ||
    cellClassNameOrigin ||
    '';
  if (cellType === 'operate') {
    if (cellClassName) {
      cellClassName += ' fixed';
    } else {
      cellClassName = 'fixed';
    }
  }
  return cellClassName;
};

const getValue = (
  column: ExcelTableType.ColumnsType,
  record: ExcelTableType.RecordData,
) => {
  const { dataIndex, cellType } = column;
  let value: ExcelTableType.CellValue = record[dataIndex];
  if (cellType === 'select') {
    const options = getOptions(column, record);
    const option = options.find((item) => item.value === value);
    value = option?.label;
  } else if (cellType === 'cascader') {
    const options = getOptions(column, record);
    value = optionsTransferToLabel(options, value as (string | number)[]);
  }

  return value;
};

export const dataFormatToGrid: (
  sourceData: ExcelTableType.ExcelTableProps['data'],
  originColumns: ExcelTableType.ColumnsType[],
  operateInfosCollect: ExcelTableType.OperateCollector,
  indexOffset?: number,
) => ExcelTableType.Grid[][] = (
  sourceData,
  originColumns,
  operateInfosCollect,
  indexOffset = 0,
) =>
  sourceData.map((record, index) => {
    const currentIndex = indexOffset + index;
    return originColumns.map((column, i) => {
      const {
        width,
        readOnly: readOnlyOrigin,
        calcReadOnly,
        cellType,
        component,
        addonAfter,
        min,
        max,
        precision,
        calcRange,
        disabledDate,
        fillable: fillableOrigin,
        calcFillable,
        title,
        rangeWarningName: rangeWarningNameOrigin,
        calcRangeWarningName,
      } = column;

      // calculate the value of readOnly
      let readOnly = readOnlyOrigin;
      if (calcReadOnly) {
        readOnly = calcReadOnly(record, currentIndex, i);
      }

      let fillable = fillableOrigin;
      if (calcFillable) {
        fillable = calcFillable(record, currentIndex, i);
      }

      const numberRange =
        (calcRange && calcRange(record, currentIndex, i)) || {};

      const rangeWarningName =
        (calcRangeWarningName &&
          calcRangeWarningName(record, currentIndex, i)) ||
        rangeWarningNameOrigin ||
        title;

      // dataEditor transfer, case: there are some operate type in a cell, such as button and select
      const dataEditor = getDataEditor(column, record);
      const valueViewer = getDataViewer(column, record);
      const cellClassName = getCellClassName(column, record);

      // case: value and 混合, select
      const value = getValue(column, record);

      return {
        key: `${currentIndex}-${i}`,
        id: record.id,
        value,
        width,
        className: cellClassName,
        readOnly,
        dataEditor,
        valueViewer,
        cellType,
        component:
          (component &&
            component(record, currentIndex, i, operateInfosCollect)) ||
          undefined,
        forceComponent: !!component,
        addonAfter,
        min,
        max,
        disabledDate:
          (disabledDate && disabledDate(record, currentIndex, i)) || undefined,
        precision,
        fillable,
        rangeWarningName,
        // disableUpdatedFlag: true,
        ...numberRange,
      };
    });
  });

export const columnsFormatting = (
  originColumns: ExcelTableType.ColumnsType[],
) => {
  const formattedColumns = originColumns.map((column) => {
    const {
      title,
      width,
      dataIndex,
      headerCellClassName: headerCellClassNameOrigin,
      cellType,
      isSegmentTitle,
    } = column;
    let headerCellClassName = headerCellClassNameOrigin;
    if (cellType === 'operate') {
      if (headerCellClassName) {
        headerCellClassName += ' fixed';
      } else {
        headerCellClassName = 'fixed';
      }
    } else if (cellType === 'number') {
      if (headerCellClassName) {
        headerCellClassName += ' right';
      } else {
        headerCellClassName = 'right';
      }
    }
    return {
      label: title,
      width,
      dataIndex,
      headerCellClassName,
      isSegmentTitle,
    };
  });

  return formattedColumns;
};

export const setElementScrollTop = (id: string, top: number): void => {
  const span: HTMLElement | null = document.querySelector<HTMLElement>(
    `#${id}`,
  );
  if (span) {
    setTimeout(() => {
      span.scrollTo(span.scrollLeft, top);
    }, 0);
  }
};
