import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sheet from '../sheet';
import { SheetEvent } from '../sheet/Event';
import { DraggableShell } from '../shell/draggableShell';
import { TableShell } from '../shell/tableShell';
import { groupConfigToGroupMap } from '../util';
import { CheckViewer } from '../viewer/checkViewer';
import { GroupViewer } from '../viewer/groupViewer';
import { useGroupConfig } from './useGroupConfig';
import { useRowSelection } from './useRowSelection';

const Table: React.FC<Table.TableProps> = ({
  columns,
  dataSource,
  rowKey,
  rowSelection,
  groupConfig,
  onChange,
  draggable,
  ...args
}) => {
  const [data, setData] = useState<Sheet.Cell[][]>([[]]);
  const sheetInstance = useRef<Sheet.SheetInstance | null>(null);

  const hasChildren = dataSource?.some(
    (item) => (item?.children as Array<Object>)?.length > 0,
  );
  const hasControl = hasChildren || rowSelection;

  const [checkedRow, setCheckedRow] = useRowSelection(
    dataSource,
    rowSelection,
    hasChildren,
  );
  const [rowGroupConfig, setGroupConfig] = useGroupConfig(
    dataSource,
    { defaultOpen: true },
    hasChildren,
  );
  const { groups, groupOpen } = rowGroupConfig || {};

  useEffect(() => {
    if (!hasChildren) return;
    if (!dataSource || !columns) return;

    const data: Sheet.Cell[][] = [];

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
      groupList.forEach((itemRow: any, subIndex) => {
        const dataRow: Sheet.Cell[] = [];
        let rowId: string = item.key || item.id || String(currentIndex);
        if (rowKey) {
          if (rowKey instanceof Function) {
            rowId = rowKey(item, row);
          } else {
            rowId = item[rowKey];
          }
        }

        dataRow.push({
          id: rowId,
          row: currentIndex,
          col: -1,
          readonly: true,
          value:
            groupMap.get(currentIndex) && groupMap.get(currentIndex)?.isStart,
          record: {
            open:
              groupMap.get(currentIndex) && groupMap.get(currentIndex)?.isOpen,
          },
          valueViewer: GroupViewer,
          className: 'sheet-control',
        } as any);

        columns.map((colInfo: Table.ColumnProps, col: number) => {
          dataRow.push({
            id: rowId,
            value: item[colInfo.dataIndex || ''],
            record: item,
            readonly: colInfo.readonly,
            align: colInfo.align,
            fixed: colInfo.fixed,
            editable: colInfo.editable,
            valueViewer: colInfo.render ? colInfo.render : undefined,
            dataEditor: colInfo.editor ? colInfo.editor : undefined,
            row: currentIndex,
            col,
          } as any);
        });
        data.push(dataRow);

        currentIndex++;
      });
    });

    setData(data);
  }, [dataSource, columns, groups, hasChildren]);

  useEffect(() => {
    if (hasChildren) return;
    if (!dataSource || !columns) return;

    setData(
      dataSource.map((item: any, row: number) => {
        let rowId: string = String(row);
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
            value: checkedRow[row] as unknown as string,
            valueViewer: CheckViewer,
            className: 'sheet-control',
          });
        }

        columns.map((colInfo: Table.ColumnProps, col: number) => {
          rows.push({
            id: rowId,
            value: item[colInfo.dataIndex || ''],
            record: item,
            readonly: colInfo.readonly,
            align: colInfo.align,
            fixed: colInfo.fixed,
            editable: colInfo.editable,
            valueViewer: colInfo.render ? colInfo.render : undefined,
            dataEditor: colInfo.editor ? colInfo.editor : undefined,
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
    (changes: Sheet.CellData[]) => {
      const newData = [...data];
      onChange &&
        onChange(
          changes.map((item) => ({
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
      return DraggableShell({ columns, className: 'baseTable' });
    }
    return TableShell({
      columns,
      className: 'baseTable',
      hasControl: !!rowSelection || hasChildren,
    });
  }, [columns, draggable, rowSelection, hasChildren]);

  return (
    <Sheet
      {...args}
      sheetInstance={sheetInstance}
      sheetRenderer={WrappedTableShell}
      groupConfig={rowGroupConfig}
      data={data}
      onCellsChanged={handleChanges}
    >
      {!hasChildren && rowSelection ? (
        <SheetEvent name="row-select" handler={handleRowSelect} />
      ) : null}
      {hasChildren ? (
        <SheetEvent
          name="group-open"
          handler={(e: unknown) => {
            const { row } = e as { row: number };
            const index = groups.findIndex((item) => item.groupStart === row);
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
                ...(newGrid[row][0] as Sheet.Cell),
                record: {
                  open: !!groupOpen[index],
                },
              };
              setData(newGrid);
              sheetInstance.current?.pushToHistory({
                type: 'Custom' as Sheet.OperateType,
                changes: [],
                extraInfo: {
                  extraType: 'group',
                  groupConfig,
                  data,
                },
              });
            }
          }}
        />
      ) : null}
    </Sheet>
  );
};

export default Table;
