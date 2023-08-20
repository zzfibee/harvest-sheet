import { Button } from 'antd';
import classNames from 'classnames';
import { cloneDeep, curry, isEmpty } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import DataSheet from './DataSheet';
import Row from './Row';
import useShell from './useShell';

import {
  changeTransfer,
  dataFormatToGrid,
  numberRangeCheck,
  valueCheck,
} from './helper';
// import './index.less';
import useRightClick from './useRightClick';

const ExcelTable = (props: ExcelTableType.ExcelTableProps) => {
  const {
    withDrawRef,
    data: fullData,
    columns: originColumns,
    onChange,
    theme,
    scroll: { y } = { y: 440 },
    overScanRowCount = 5,
    rowHeight = 40,
    freePaste,
    handleFill,
    errorRowsIndex = [],
    collapsed = true,
    handleAdd,
    handleCollapse,
    rowClassName,
  } = props;

  const tableIdRef = useRef<string>(`t${Math.random().toString(36).slice(2)}`);

  const scrollTopRef = useRef<number>(0);
  const dataRef = useRef<ExcelTableType.RecordData[]>(fullData);
  const focusRef = useRef<ExcelTableType.FocusControl>({});

  const visualDataRef = useRef<number>(Math.floor(y / rowHeight));

  const [indexInfo, setIndexInfo] = useState<{
    startIndex: number;
    endIndex: number;
  }>({
    startIndex: 0,
    endIndex: Math.min(
      Math.max(0, dataRef.current.length - 1),
      overScanRowCount + visualDataRef.current,
    ),
  });

  const previousStepsRef = useRef<ExcelTableType.StepInfoCollect[]>([]);

  const operateInfosCollect: ExcelTableType.OperateCollector = curry(
    (
      type: ExcelTableType.OperateType,
      operateInfo: ExcelTableType.OperateInfos,
    ) => {
      if (type === 3 || type === 1) {
        const { row = -1 } = operateInfo;
        row >= 0 &&
          focusRef?.current.focusCell &&
          focusRef.current.focusCell(
            { rowIndex: row + 1, columnIndex: 0 },
            { rowIndex: row + 1, columnIndex: originColumns?.length },
          );
      }
      const length = previousStepsRef.current.unshift({
        type,
        operateInfos: operateInfo,
      });
      if (length > 10) {
        previousStepsRef.current.pop();
      }
    },
  );

  useEffect(() => {
    if (!withDrawRef) {
      return;
    }
    withDrawRef.current = {
      collectCustomOperate: (value: any) => {
        const length = previousStepsRef.current.unshift({
          type: 7,
          operateInfos: { customInfos: value },
        });
        if (length > 10) {
          previousStepsRef.current.pop();
        }
      },
    };
  }, []);

  // 修改成功后的回调
  const changeSuccess = curry(
    (
      type: ExcelTableType.OperateType,
      changeData: ExcelTableType.CellKeyInfo[],
      originData?: ExcelTableType.RecordData[],
      newData?: ExcelTableType.RecordData[],
    ) => {
      const oldData: ExcelTableType.StepInfosType = [];
      const ids: number[] = [];
      changeData.forEach((item) => {
        const { id, row, col, field, parentId } = item;
        if (
          parentId &&
          !isEmpty(originData?.find((d: any) => d.id === parentId)?.children)
        ) {
          if (id < 0) {
            //  不存在
            // console.log('how');
          }
          const parent = originData?.find((d: any) => d.id === parentId);
          const child = parent?.children?.find(
            (d: any) => String(d.id) === String(id),
          );
          oldData.push({
            id: id as unknown as string,
            row,
            col,
            field,
            value: child[field] as string | undefined,
          });
        } else {
          // eslint-disable-next-line no-lonely-if
          if (id < 0 && newData) {
            ids.push(newData[row]?.id);
          } else if (originData) {
            oldData.push({
              id: id as unknown as string,
              row,
              col,
              field,
              value: originData?.[row]?.[field] as string | undefined,
            });
          }
        }
      });
      operateInfosCollect(type, {
        infos: oldData,
        newIds: ids,
        originData,
      } as ExcelTableType.OperateInfos);
    },
  );

  const handleBackSuccess = () => {
    const last = previousStepsRef.current.shift();
    const { row = -1, col = -1 } = last?.operateInfos.infos?.[0] || {};
    const { type } = last || {};

    if (row >= 0) {
      const start = { rowIndex: row };
      if (col >= 0) {
        const current = { ...start, columnIndex: col };
        focusRef.current.focusCell &&
          focusRef.current.focusCell(current, current);
        // handleFocus(current, current);
      } else if (type === 3 || type === 1) {
        const rowFirst = { ...start, columnIndex: 0 };
        const rowLast = { ...start, columnIndex: originColumns.length - 1 };
        focusRef.current.focusCell &&
          focusRef.current.focusCell(rowFirst, rowLast);
        // handleFocus(rowFirst, rowLast);
      }
    }
  };

  const handleCollapsedWithRevert = useCallback(
    (value: boolean) => {
      operateInfosCollect(2, {
        infos: [{ totalCollapsed: !value }],
      } as ExcelTableType.OperateInfos);
      handleCollapse && handleCollapse(value);
    },
    [handleCollapse],
  );

  const handleBack = () => {
    if (!previousStepsRef?.current?.length) {
      return;
    }
    const backSuccess = () => handleBackSuccess();
    const { type, operateInfos } = previousStepsRef.current[0];
    const { infos, newIds: ids, originData } = operateInfos;
    if (type === 6) {
      onChange &&
        onChange(infos as any, backSuccess, { type, oldData: originData });
    } else if (type === 5) {
      onChange &&
        onChange(infos as any, backSuccess, {
          hasNewLine: !!ids?.length,
          ids,
          type,
        });
    } else if (type === 4) {
      onChange &&
        onChange(infos as any, backSuccess, { hasNewLine: false, ids, type });
    } else if (type === 3) {
      const { id } = infos?.[0] ?? {};
      onChange &&
        onChange(infos as any, backSuccess, {
          hasNewLine: true,
          ids: [id],
          type,
        });
    } else if (type === 2) {
      const { collapsed: collapsedList, totalCollapsed } = infos?.[0] ?? {};
      handleCollapse && handleCollapse(totalCollapsed, collapsedList);
      backSuccess();
    } else if (type === 1) {
      onChange &&
        onChange(infos as any, backSuccess, { hasNewLine: true, ids, type });
    } else {
      onChange &&
        onChange(infos as any, backSuccess, {
          type,
          oldData: operateInfos.customInfos,
        });
    }
  };

  const dataFormatToGridHance = (
    sourceData: ExcelTableType.ExcelTableProps['data'],
    columns: ExcelTableType.ColumnsType[],
    indexOffset?: number,
  ) => dataFormatToGrid(sourceData, columns, operateInfosCollect, indexOffset);

  const [allGrid, setAllGrid] = useState<ExcelTableType.Grid[][]>(
    dataFormatToGridHance(fullData, originColumns),
  );

  const updateGridsByCellChange = (d: ExcelTableType.RecordData[]) => {
    const { startIndex, endIndex } = indexInfo;
    const changeData = d.slice(startIndex, endIndex + 1);
    const changeDataTransfer = dataFormatToGridHance(
      changeData,
      originColumns,
      startIndex,
    );
    const grids = allGrid.slice(0);
    grids.splice(startIndex, endIndex - startIndex + 1, ...changeDataTransfer);

    return grids;
  };

  // data 和 columns 变化的时候需要重新调整一下Grid
  useEffect(() => {
    let grids;
    if (dataRef.current.length !== fullData.length) {
      grids = dataFormatToGridHance(fullData, originColumns);
    } else if (fullData.length) {
      grids = updateGridsByCellChange(fullData);
    }
    if (grids) {
      setAllGrid(grids);
    }
    dataRef.current = fullData;
  }, [fullData]);

  useEffect(() => {
    // originColumns 变化的时候需要重新调整一下AllGrid
    const grids = dataFormatToGridHance(fullData, originColumns);
    setAllGrid(grids);
  }, [originColumns]);

  const handleCellsChange = useCallback(
    (
      changes: ExcelTableType.ChangeCellData[],
      additions: ExcelTableType.ChangeCellData[] = [],
    ) => {
      const changesData: ExcelTableType.CellKeyInfo[] = [];
      let haveNewLine = false;
      const newData = cloneDeep(fullData);

      [...changes, ...additions].forEach((cellData) => {
        let { value } = cellData;

        if (changes.length === 1) {
          value = numberRangeCheck(cellData, true);
        }

        const cellDataAdjust = {
          ...cellData,
          value,
          row: cellData.row + indexInfo.startIndex,
        };

        if (!newData[cellDataAdjust.row]) {
          newData[cellDataAdjust.row] = {};
        }

        const changeData: ExcelTableType.CellKeyInfo = changeTransfer(
          fullData,
          originColumns,
          cellDataAdjust,
        );
        newData[cellDataAdjust.row][changeData.field] = changeData.value;

        const canCopy = valueCheck(fullData, originColumns, cellDataAdjust);
        const canNewCopy =
          canCopy || valueCheck(newData, originColumns, cellDataAdjust);

        if (canCopy || canNewCopy) {
          haveNewLine = changeData.id < 0;
          if (canNewCopy) {
            const realChange = changeTransfer(
              newData,
              originColumns,
              cellDataAdjust,
            );
            changesData.push(realChange);
          } else {
            changesData.push(changeData);
          }
        }
      });

      if (onChange && changesData.length) {
        const type = haveNewLine ? 5 : 6;
        // 这一步只能收集用户输入的变更，不能收集关联的表格的变化
        const handleChangeSuccess = changeSuccess(type, changesData);
        onChange(changesData, handleChangeSuccess);
      }
    },
    [fullData, originColumns, indexInfo],
  );

  // 表头
  const calcBodyTop = () => {
    const overScanHeight = overScanRowCount * rowHeight;
    let top = scrollTopRef.current;

    if (top < overScanHeight) {
      top = 0;
    } else {
      top -= overScanHeight;
    }

    return top + 40;
  };

  const renderShell = useShell(
    originColumns,
    calcBodyTop,
    handleCollapsedWithRevert,
    collapsed,
  );

  // 右键菜单
  const handleCellContextMenu = (
    type: 1 | 2 | 3,
    cellInfo: ExcelTableType.ChangeCellData,
  ) => {
    const currentData = changeTransfer(fullData, originColumns, cellInfo);
    handleFill && handleFill(type, currentData);
  };

  const { handleContextMenu, handleMenuHide } = useRightClick(
    handleCellContextMenu,
    !!handleFill,
  );

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={classNames('tableWrapper', theme?.tableWrapper)}
        id={tableIdRef.current}
      >
        <DataSheet
          data={allGrid as any}
          sheetRenderer={renderShell}
          freePaste={freePaste}
          rowRenderer={Row as any}
          onCellsChanged={handleCellsChange as any}
          onContextMenu={handleContextMenu as any}
          handleBack={handleBack}
          rowClassName={rowClassName}
        />
      </div>

      {handleAdd && (
        <Button
          type="dashed"
          block
          onClick={() =>
            handleAdd(
              (infos?: ExcelTableType.StepInfosType, newIds?: number[]) => {
                operateInfosCollect(1, {
                  row: indexInfo.endIndex,
                  newIds,
                  infos,
                });
              },
            )
          }
        >
          + 添加
        </Button>
      )}
    </div>
  );
};

export default ExcelTable;
