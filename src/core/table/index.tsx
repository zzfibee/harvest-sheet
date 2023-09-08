import { Sheet } from '@zhenliang/sheet';
import { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { Button } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SheetEvent } from '../sheet/Event';
import { DraggableShell } from '../shell/draggableShell';
import { TableShell } from '../shell/tableShell';
import { groupConfigToGroupMap } from '../util';
import { CheckViewer } from '../viewer/checkViewer';
import { GroupViewer } from '../viewer/groupViewer';
import { useGroupConfig } from './useGroupConfig';
import { useRowSelection } from './useRowSelection';

const Table: React.FC<SheetTableType.TableProps> = ({
  sheetInstance: sheetRef,
  columns,
  dataSource,
  rowKey,
  rowSelection,
  groupConfig,
  onChange,
  handleAdd,
  draggable,
  eventHandler,
  ...args
}) => {
  const [data, setData] = useState<SheetType.Cell[][]>([[]]);
  const _sheetInstance = useRef<SheetType.SheetInstance | null>(null);
  const sheetInstance = sheetRef || _sheetInstance;

  const hasChildren = dataSource?.some(
    (item) => (item?.children as Array<any>)?.length > 0,
  );
  const hasControl = hasChildren || rowSelection;

  const [checkedRow, setCheckedRow] = useRowSelection(
    dataSource,
    rowSelection,
    hasChildren,
  );
  const [rowGroupConfig, setGroupConfig] = useGroupConfig(
    dataSource,
    { defaultOpen: true, ...groupConfig },
    hasChildren,
  );
  const { groups, groupOpen } = rowGroupConfig || {};

  useEffect(() => {
    if (!hasChildren) return;
    if (!dataSource || !columns) return;

    const data: SheetType.Cell[][] = [];

    const groupMap = groupConfigToGroupMap({
      groups,
      groupOpen,
    });

    let currentIndex = 0;
    dataSource.forEach((item: any, row: number) => {
      let groupList = [item];
      if (item.children) {
        groupList = [item, ...item.children];
      }
      groupList.forEach((itemRow: any) => {
        const dataRow: SheetType.Cell[] = [];
        let rowId: string = itemRow.id || itemRow.key || String(currentIndex);
        if (rowKey) {
          if (rowKey instanceof Function) {
            rowId = rowKey(itemRow, row);
          } else {
            rowId = itemRow[rowKey];
          }
        }

        dataRow.push({
          id: rowId,
          row: currentIndex,
          col: -1,
          editable: !(columns?.[0].editable instanceof Function)
            ? columns?.[0]?.editable
            : columns?.[0]?.editable('', itemRow, currentIndex),
          readonly: !(columns?.[0].readonly instanceof Function)
            ? columns?.[0]?.readonly
            : columns?.[0]?.readonly('', itemRow, currentIndex),
          align: 'center',
          fixed: 'unset',
          value:
            groupMap.get(currentIndex) && groupMap.get(currentIndex)?.isStart,
          record: {
            open:
              groupMap.get(currentIndex) && groupMap.get(currentIndex)?.isOpen,
          },
          valueViewer: GroupViewer,
          className: 'sheet-control',
        } as any);

        columns.forEach((colInfo: SheetTableType.ColumnProps, col: number) => {
          const value = itemRow[colInfo.dataIndex || ''];
          dataRow.push({
            id: rowId,
            value,
            record: itemRow,
            readonly: !(colInfo.readonly instanceof Function)
              ? colInfo.readonly
              : colInfo.readonly(value, itemRow, currentIndex),
            align: colInfo.align,
            fixed: colInfo.fixed,
            editable: !(colInfo.editable instanceof Function)
              ? colInfo.editable
              : colInfo.editable(value, itemRow, currentIndex),
            valueViewer: colInfo.render ? colInfo.render : undefined,
            dataEditor: colInfo.editor ? colInfo.editor : undefined,
            row: currentIndex,
            className: !(colInfo.cellConfig?.className instanceof Function)
              ? colInfo.cellConfig?.className
              : colInfo.cellConfig?.className(value, itemRow, currentIndex),
            col,
          } as any);
        });
        data.push(dataRow);

        currentIndex++;
      });
    });

    setData(data);
  }, [dataSource, columns, groups, hasChildren, rowGroupConfig]);

  useEffect(() => {
    if (hasChildren) return;
    if (!dataSource || !columns) return;

    setData(
      dataSource.map((item: any, row: number) => {
        let rowId: string = item.id || item.key || String(row);
        if (rowKey) {
          if (rowKey instanceof Function) {
            rowId = rowKey(item, row);
          } else {
            rowId = item[rowKey];
          }
        }
        const rows = [];
        if (rowSelection) {
          rows.push({
            id: rowId,
            row,
            col: -1,
            readonly: true,
            align: 'center' as SheetType.CellAlign,
            value: checkedRow[row] as unknown as string,
            valueViewer: CheckViewer,
            className: 'sheet-control',
          });
        }

        columns.forEach((colInfo: SheetTableType.ColumnProps, col: number) => {
          const value = item[colInfo.dataIndex || ''];
          rows.push({
            id: rowId,
            value,
            record: item,
            readonly: !(colInfo.readonly instanceof Function)
              ? colInfo.readonly
              : colInfo.readonly(value, item, row),
            align: colInfo.align,
            fixed: colInfo.fixed,
            editable: !(colInfo.editable instanceof Function)
              ? colInfo.editable
              : colInfo.editable(value, item, row),
            valueViewer: colInfo.render ? colInfo.render : undefined,
            dataEditor: colInfo.editor ? colInfo.editor : undefined,
            className: !(colInfo.cellConfig?.className instanceof Function)
              ? colInfo.cellConfig?.className
              : colInfo.cellConfig?.className(value, item, row),
            row,
            col,
          });
        });
        return rows;
      }),
    );
  }, [dataSource, columns, checkedRow, hasChildren]);

  useEffect(() => {
    if (!dataSource || !columns) {
      setData([[]]);
    }
  }, [dataSource, columns]);

  const handleChanges = useCallback(
    (changes: SheetType.CellData[], extChange?: SheetType.CellData[]) => {
      onChange &&
        onChange(
          changes.map((item) => ({
            row: item.row,
            id: item.id,
            key: columns[hasControl ? item.col - 1 : item.col]
              .dataIndex as string,
            value: item.value,
          })),
          extChange?.map((item) => ({
            row: item.row,
            id: item.id,
            key: columns[hasControl ? item.col - 1 : item.col]
              .dataIndex as string,
            value: item.value,
          })),
        );
    },
    [columns, onChange, hasControl],
  );

  const handleReverse = useCallback(
    (value: unknown) => {
      const { type, extraInfo } = value as SheetType.OperateHistory;
      if (type === 'Custom') {
        const {
          groupConfig,
          extraType,
          data: lastData,
        } = extraInfo as {
          extraType: string;
          groupConfig: SheetType.RowGroupConfig;
          data: SheetType.Cell[][];
        };
        if (extraType === 'group') {
          setGroupConfig(groupConfig);
          setData(lastData);
        }
      }
    },
    [data, groupConfig],
  );
  const handleRowSelect = useCallback(
    (value: unknown) => {
      if (!sheetInstance.current) return;
      // sheetInstance.current?.selectRow(value as number);
      const newChecked = Array(checkedRow.length).fill(false);
      newChecked[value as number] = !newChecked[value as number];
      setCheckedRow(newChecked);
    },
    [sheetInstance, checkedRow],
  );
  const WrappedTableShell = useMemo(() => {
    if (draggable) {
      return DraggableShell({
        columns,
        className: 'baseTable',
        showGroup: hasChildren,
        showSelect: !!rowSelection,
        controlProps: {
          group: {
            open: !rowGroupConfig?.groupOpen?.some((value: boolean) => !value),
          },
          check: {
            checked: false,
          },
        },
      });
    }
    return TableShell({
      columns,
      className: 'baseTable',
      showGroup: hasChildren,
      showSelect: !!rowSelection,
      controlProps: {
        group: {
          open: !rowGroupConfig?.groupOpen?.some((value: boolean) => !value),
        },
        check: {
          checked: false,
        },
      },
    });
  }, [columns, draggable, rowSelection, hasChildren, rowGroupConfig]);

  return (
    <Sheet
      {...args}
      sheetInstance={sheetInstance}
      sheetRenderer={WrappedTableShell}
      groupConfig={rowGroupConfig}
      data={data}
      onCellsChanged={handleChanges}
    >
      {!hasChildren && rowSelection
        ? [
            <SheetEvent
              key="row-select"
              name="row-select"
              handler={handleRowSelect}
            />,
            <SheetEvent
              key="row-select-title"
              name="row-select-title"
              handler={handleRowSelect}
            />,
          ]
        : null}
      {hasChildren
        ? [
            <SheetEvent
              key="group-open"
              name="group-open"
              handler={(e: unknown) => {
                const { row } = e as { row: number };
                const index = groups.findIndex(
                  (item) => item.groupStart === row,
                );
                if (index >= 0) {
                  const groupOpen = [...rowGroupConfig.groupOpen];
                  groupOpen[index] = !rowGroupConfig.groupOpen[index];

                  setGroupConfig({
                    ...rowGroupConfig,
                    groupOpen: groupOpen,
                  });
                  const newGrid = [...data];
                  newGrid[row] = [...newGrid[row]];
                  newGrid[row][0] = {
                    ...(newGrid[row][0] as SheetType.Cell),
                    record: {
                      open: !!groupOpen[index],
                    },
                  };
                  setData(newGrid);
                  sheetInstance.current?.pushToHistory({
                    type: 'Custom' as SheetType.OperateType,
                    changes: [],
                    extraInfo: {
                      extraType: 'group',
                      groupConfig: rowGroupConfig,
                      data,
                    },
                  });
                }
              }}
            />,
            <SheetEvent
              key="group-open-title"
              name="group-open-title"
              handler={(value) => {
                setGroupConfig({
                  ...rowGroupConfig,
                  groupOpen: Array(rowGroupConfig.groupOpen.length).fill(value),
                });

                sheetInstance.current?.pushToHistory({
                  type: 'Custom' as SheetType.OperateType,
                  changes: [],
                  extraInfo: {
                    extraType: 'group',
                    groupConfig: rowGroupConfig,
                    data,
                  },
                });
              }}
            />,
          ]
        : null}

      <SheetEvent key="_reverse" name="reverse" handler={handleReverse} />
      {Object.keys(eventHandler || {}).map((key) => (
        <SheetEvent key={key} name={key} handler={eventHandler?.[key]} />
      ))}
      {handleAdd ? (
        <Button
          type="dashed"
          style={{ width: '100%', height: 32 }}
          onClick={handleAdd}
        >
          + 添加
        </Button>
      ) : null}
    </Sheet>
  );
};

export default Table;
