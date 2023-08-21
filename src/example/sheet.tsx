import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Sheet } from '@harvest/sheet';
import { Tooltip } from 'antd';
import { cloneDeep, isNil, random, range } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SheetEvent } from '../core/sheet/Event';
import { DraggableShell } from '../core/shell/draggableShell';
import { changeGroupConfig } from '../core/util';
import { useSheetEvent } from '../hooks';
import './index.less';

const ExcelIndexCell: React.FC<{ value: string; row: number; record: any }> = ({
  value,
  row,
  record,
}) => {
  const eventBus = useSheetEvent();
  const handleClick = useCallback(() => {
    eventBus.emit('onCellClick', { row });
  }, []);

  return (
    <span
      className="excel-index-cell"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        color: record?.color,
      }}
    >
      {!isNil(record?.open) ? (
        record?.open ? (
          <MinusCircleOutlined />
        ) : (
          <Tooltip overlay={record.groups} trigger={['hover']}>
            <PlusCircleOutlined />
          </Tooltip>
        )
      ) : null}
      {value}
    </span>
  );
};

const grid: Sheet.Cell[][] = range(1, 120).map((row, rowIndex) =>
  range(0, 26).map((i) => ({
    id: String(random(0, 1)),
    readonly: i === 0 ? true : false,
    fixed: i === 0 ? 'left' : undefined,
    value: i === 0 ? row : row > 15 || i > 10 ? '' : `${row}-${i}`,
    valueViewer: i === 0 ? ExcelIndexCell : undefined,
    record: [1, 7].includes(rowIndex)
      ? {
          open: true,
          color: 'inherit',
          groups: rowIndex === 1 ? [1, 2, 3, 4, 5] : [7, 8, 9],
        }
      : undefined,
    align: 'center',
  })),
) as any;

const BasicSheet: React.FC = () => {
  const [state, setState] = useState<Sheet.Cell[][]>(grid);
  const sheetInstance = useRef<Sheet.SheetInstance | null>(null);
  const [groupConfig, setGroupConfig] = useState({
    groups: [
      { groupStart: 1, groupEnd: 5, groupName: 'group1' },
      { groupStart: 7, groupEnd: 9, groupName: 'group2' },
    ],
    groupOpen: [true, true],
  });

  const handleNewRow = useCallback(
    (index: number) => {
      const newGrid = cloneDeep(state);
      const newRow = cloneDeep(newGrid[0]);
      newRow.forEach((item, i) => {
        item.value = '';
        item.record = undefined;
      });
      newGrid.splice(index, 0, newRow);
      newGrid.forEach((row, index) => {
        row[0].value = index + 1;
      });
      sheetInstance.current?.pushToHistory({
        type: 'NewRow' as Sheet.OperateType,
        changes: [],
        rowInfo: {
          newRow: index + 1,
        },
        extraInfo: groupConfig,
      });
      const newGroupConfig = changeGroupConfig(groupConfig, { add: index });
      setState(newGrid);
      setGroupConfig(newGroupConfig);
      sheetInstance.current?.selectRow(index);
    },
    [state, groupConfig],
  );
  const handleDeleteRow = useCallback(
    (index: number) => {
      const newGrid = cloneDeep(state);
      const deleteRow = newGrid.splice(index - 1, 1);
      newGrid.forEach((row, index) => {
        row[0].value = index + 1;
      });

      const newGroupConfig = changeGroupConfig(groupConfig, { remove: index });

      sheetInstance.current?.pushToHistory({
        type: 'DeleteRow' as Sheet.OperateType,
        changes: deleteRow[0].map(
          (item, col) =>
            ({
              cell: item,
              row: index,
              col: col,
            } as any),
        ),
        rowInfo: {
          deleteRow: index,
        },
        extraInfo: groupConfig,
      });

      setGroupConfig(newGroupConfig);
      setState(newGrid);
    },
    [state],
  );
  const handleReverse = useCallback(
    (value: unknown) => {
      const { type, changes, rowInfo, extraInfo } =
        value as Sheet.OperateHistory;
      let newGrid = [...state];
      if (type === 'NewRow') {
        if (!rowInfo?.newRow && rowInfo?.newRow !== 0) return;
        newGrid.splice(rowInfo.newRow - 1, 1);
        newGrid.forEach((row, index) => {
          row[0].value = index + 1;
        });
        setState(newGrid);
        setGroupConfig(extraInfo as Sheet.RowGroupConfig);
        sheetInstance.current?.selectRow();
      } else if (type === 'DeleteRow') {
        if (!rowInfo?.deleteRow && rowInfo?.deleteRow !== 0) return;
        newGrid.splice(
          rowInfo.deleteRow - 1,
          0,
          changes.map((item) => item.cell) as Sheet.Cell[],
        );
        newGrid.forEach((row, index) => {
          row[0].value = index + 1;
        });
        setState(newGrid);
        setGroupConfig(extraInfo as Sheet.RowGroupConfig);
      } else if (type === 'Custom') {
        const {
          groupConfig,
          extraType,
          state: lastState,
        } = extraInfo as {
          extraType: string;
          groupConfig: Sheet.RowGroupConfig;
          state: Sheet.Cell[][];
        };
        if (extraType === 'group') {
          setGroupConfig(groupConfig);
          setState(lastState);
        }
      }
    },
    [state, groupConfig],
  );

  const onCellsChanged = (changes: any) => {
    const newGrid = [...state];
    changes.forEach(({ cell, row, col, value }: any) => {
      const newRow = [...newGrid[row]];
      newRow[col] = { ...newRow[col], value };
      newGrid[row] = newRow;
    });
    setState(newGrid);
  };

  const WrappedTableShell = useMemo(() => {
    return DraggableShell({
      columns: range(26).map((i) => {
        if (i > 26)
          return {
            title:
              String.fromCharCode(64 + i / 26) +
              String.fromCharCode(64 + (i % 26)),
            width: 100,
            align: 'center',
          };
        return {
          title: i === 0 ? '' : String.fromCharCode(64 + i),
          fixed: i === 0 ? 'left' : undefined,
          width: i === 0 ? 50 : 80,
          align: 'center',
        };
      }),
      className: 'baseTable',
    });
  }, []);

  const MenuRender = useCallback(
    (props: Sheet.MenuRenderProps) => {
      const { position, onContextMenu: handleMenu, cell } = props;
      const { top, left } = position || {};
      if (!cell) return null;
      return (
        <div
          className="harvest-menu"
          style={{ top, left, background: 'white' }}
        >
          <div
            className="harvest-menu-item"
            onClick={(e) =>
              handleMenu &&
              handleMenu({
                type: '1',
                row: cell.row + 1,
              })
            }
            style={{ padding: '5px 10px' }}
          >
            向下插入行
          </div>
          <div
            className="harvest-menu-item"
            onClick={(e) =>
              handleMenu &&
              handleMenu({
                type: '2',
                row: cell.row + 1,
              })
            }
          >
            向上插入行{' '}
          </div>
          <div
            className="harvest-menu-item"
            onClick={(e) =>
              handleMenu &&
              handleMenu({
                type: '3',
                row: cell.row + 1,
              })
            }
          >
            删除行
          </div>
        </div>
      );
    },
    [handleNewRow],
  );
  const handleMenuClick = useCallback(
    (e: any) => {
      const { type, row } = e as { type: string; row: number };
      console.log('click', state.length);
      if (type === '1') {
        handleNewRow(row);
      }
      if (type === '2') {
        handleNewRow(row - 1);
      }
      if (type === '3') {
        handleDeleteRow(row);
      }
    },
    [state, groupConfig],
  );
  console.log('render', performance.now());
  useEffect(() => {
    console.log('rendered', performance.now());
  }, []);
  console.log(state.length);

  return (
    <Sheet
      sheetInstance={sheetInstance}
      className="excel-sheet"
      virtualized
      data={state as any}
      groupConfig={groupConfig}
      scroll={{ x: '100%', y: '100vh' }}
      sheetRenderer={WrappedTableShell}
      menuRenderer={MenuRender}
      onCellsChanged={onCellsChanged}
      onContextMenu={handleMenuClick}
    >
      <SheetEvent
        name="onCellClick"
        handler={(e: unknown) => {
          const { row } = e as { row: number };
          const index = groupConfig.groups.findIndex(
            (item) => item.groupStart === row,
          );
          if (index >= 0) {
            console.log('changed');
            const groupOpen = [...groupConfig.groupOpen];
            groupOpen[index] = !groupConfig.groupOpen[index];

            const newGrid = [...state];
            newGrid[row] = [...newGrid[row]];
            newGrid[row][0] = {
              ...(newGrid[row][0] as Sheet.Cell),
              record: {
                open: !!groupOpen[index],
                color: groupOpen[index] ? 'inherit' : 'green',
              },
            };
            setGroupConfig({
              ...groupConfig,
              groupOpen: groupOpen,
            });
            setState(newGrid);
            sheetInstance.current?.pushToHistory({
              type: 'Custom' as Sheet.OperateType,
              changes: [],
              extraInfo: {
                extraType: 'group',
                groupConfig,
                state,
              },
            });
          }
        }}
      />
      <SheetEvent name="reverse" handler={handleReverse} />
      <div style={{ display: 'flex' }}>
        <div
          onClick={() => {
            sheetInstance.current?.zoomTo(0);
          }}
        >
          回到顶部
        </div>
        <div
          onClick={() => {
            sheetInstance.current?.zoomTo();
          }}
        >
          回到编辑行
        </div>
      </div>
    </Sheet>
  );
};

export default BasicSheet;