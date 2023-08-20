import { Button, Space } from 'antd';
import { cloneDeep, isNil } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Moment } from 'moment';
// import Example from './index';
// import Example from './ExpandWrapper';
import { default as Example } from './ExcelTable/index';

const generateData: (
  count?: number,
  deep?: number,
  parent?: number,
) => ExcelTableType.RecordData[] = (count = 10, deep = 0, parent = undefined) =>
  new Array(count).fill(1).map((item, index) => ({
    id: String(Math.random()) as any,
    parentId: parent,
    index: !isNil(parent) ? `${parent}-${index}` : index,
    // children: deep === 0 ? (generateData(2, 1, index) as any) : undefined,
    floorId: (index % 3) + 1,
    floorIdT: 1,
    tenantNo: index + 2,
    alternatives: index + 3,
    propertyType: index + 4,
    propertySubtype: (index % 3) + 1,
    cascader: [1, 11, 111],
  }));

const OperateBtns =
  (
    handleClick: (
      type: 1 | 2,
      record: ExcelTableType.RecordData,
      operateInfoGet?: ExcelTableType.OperateCollectInnerType,
    ) => (event: any) => void,
  ) =>
  (
    record: ExcelTableType.RecordData,
    row: number,
    col: number,
    operateCb?: ExcelTableType.OperateCollector,
  ) =>
    (
      <Space size={[16, 0]}>
        <Button
          type="primary"
          onClick={handleClick(
            1,
            record,
            (infos, newIds) =>
              operateCb && operateCb(1, { row, infos, newIds }),
          )}
        >
          复制
        </Button>
        <Button
          type="primary"
          ghost
          onClick={handleClick(
            2,
            record,
            (infos) => operateCb && operateCb(4, { row, infos }),
          )}
        >
          删除
        </Button>
      </Space>
    );

const Demo = () => {
  const [data, setData] = useState<ExcelTableType.ExcelTableProps['data']>([]);
  const tableCollectorRef = useRef<ExcelTableType.withDrawCollector>();

  const handleClick = useCallback(
    (
        type: 1 | 2,
        record: ExcelTableType.RecordData,
        operateInfoGet?: (infos: any, ids?: number[]) => void,
      ) =>
      (event: any) => {
        const { id, parentId } = record;
        if (parentId) {
          const newData = cloneDeep(data);
          const parentIndex = data.findIndex((item) => item.id === parentId);
          const childrenIndex = data[parentIndex].children.findIndex(
            (item: any) => item.id === id,
          );
          if (type === 1) {
            const newID = Math.random();
            if (!newData[parentIndex].children) {
              newData[parentIndex].children = [];
            }
            newData[parentIndex].children.splice(childrenIndex + 1, 0, {
              ...record,
              id: newID,
            });

            operateInfoGet && operateInfoGet([{}], [newID]);
          } else if (type === 2) {
            newData[parentIndex].children = newData[
              parentIndex
            ].children.filter((d: any) => d.id !== id);

            operateInfoGet &&
              operateInfoGet(
                [{ row: childrenIndex, extra: record, parentId }],
                undefined,
              );
          }

          setData(newData);
          return;
        }

        const index = data.findIndex((item) => item.id === id);
        if (type === 1) {
          const newData = [...data];
          const newID = Math.random();
          newData.splice(index + 1, 0, { ...record, id: newID, children: [] });
          setData(newData);
          operateInfoGet && operateInfoGet([{}], [newID]);
        } else if (type === 2) {
          const dataNew = data.filter((d) => d.id !== record.id);
          setData(dataNew);
          operateInfoGet &&
            operateInfoGet([{ row: index, extra: record }], undefined);
        }
      },
    [data],
  );

  useEffect(() => {
    setTimeout(() => {
      setData(generateData());
    }, 500);
  }, []);

  const columns: ExcelTableType.ColumnsType[] = useMemo(
    () => [
      {
        title: '#',
        isSegmentTitle: true,
        dataIndex: 'index',
        width: 100,
        cellType: 'text',
        calcCellClassName: (record: ExcelTableType.RecordData) => `right`,
      },
      {
        title: '下拉',
        dataIndex: 'floorId',
        width: 170,
        cellType: 'select',
        getSelectOptions: () => [
          { label: 'one', value: 1 },
          { label: 'two', value: 2 },
          { label: 'three', value: 3 },
        ],
      },
      {
        title: '日期',
        dataIndex: 'tenantNo',
        width: 200,
        cellType: 'date',
        fillable: true,
        disabledDate:
          (
            record: ExcelTableType.RecordData,
            rowIndex: number,
            colIndex: number,
          ) =>
          (currentDate: Moment) =>
            !currentDate,
      },
      {
        title: '数字',
        rangeWarningName: '数字列名',
        dataIndex: 'alternatives',
        width: 150,
        cellType: 'number',
        addonAfter: '%',
        min: 0,
        max: 100,
        calcFillable: (
          record: ExcelTableType.RecordData,
          rowIndex: number,
          colIndex: number,
        ) => rowIndex === 2,
        calcRangeWarningName: (
          record: ExcelTableType.RecordData,
          rowIndex?: number,
          colIndex?: number,
        ) => 'calc warning name',
      },
      {
        title: '只读',
        dataIndex: 'propertyType',
        width: 100,
        cellType: 'text',
        readOnly: true,
      },
      {
        title: '文本',
        dataIndex: 'propertySubtype',
        width: 130,
        cellType: 'text',
      },
      {
        title: '',
        dataIndex: 'propertySubtype1',
        width: 130,
        cellType: 'select',
        getSelectOptions: () => [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
        ],
      },
      {
        title: '级联',
        dataIndex: 'cascader',
        width: 170,
        cellType: 'cascader',
        options: [
          {
            label: 'one',
            value: 1,
            children: [
              {
                label: 'one1',
                value: 11,
                children: [{ label: 'one11', value: 111 }],
              },
              {
                label: 'one2',
                value: 12,
                children: [{ label: 'one21', value: 121 }],
              },
            ],
          },
          {
            label: 'two',
            value: 2,
            children: [
              {
                label: 'one',
                value: 22,
                children: [{ label: 'one', value: 222 }],
              },
            ],
          },
          {
            label: 'three',
            value: 3,
            children: [
              {
                label: 'one',
                value: 33,
                children: [{ label: 'one', value: 333 }],
              },
            ],
          },
        ],
      },
      {
        title: '单元号',
        dataIndex: 'tenantNoT',
        width: 100,
        cellType: 'number',
        precision: 0,
      },
      {
        title: '承租方',
        dataIndex: 'alternativesT',
        width: 150,
        cellType: 'number',
        calcRange: (record, rowIndex, columnIndex) => ({
          min: 0,
          max: 99999999999,
        }),
      },
      {
        title: '评估业态',
        dataIndex: 'propertyTypeT',
        width: 100,
        cellType: 'text',
        readOnly: true,
      },
      {
        title: '评估类型',
        dataIndex: 'propertySubtypeT',
        width: 130,
        cellType: 'text',
      },
      {
        title: '',
        dataIndex: 'propertySubtypeTT',
        width: 130,
        cellType: 'select',
        getSelectOptions: () => [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
        ],
      },
      {
        title: '操作',
        width: 265,
        dataIndex: 'id',
        cellType: 'operate',
        component: OperateBtns(handleClick),
      },
    ],
    [handleClick],
  );

  const handleChange = (
    changeData: {
      id: number;
      row: number;
      col: number;
      field: string;
      value: ExcelTableType.CellValue;
      parentId?: number;
      extra?: unknown;
    }[],
    handleChangeSuccess?: (
      oldData?: ExcelTableType.RecordData[],
      newData?: ExcelTableType.RecordData[],
    ) => void,
    withDrawConfig?: {
      type: ExcelTableType.OperateType;
      hasNewLine?: boolean;
      oldData?: unknown;
      ids?: unknown[];
    },
  ) => {
    if (withDrawConfig?.type === 7) {
      const { shit, type } = withDrawConfig.oldData as {
        shit: any;
        type: string;
      };
      if (type === 'fill') {
        setData(cloneDeep(shit));
      } else {
        // message.warn(`${shit}`);
      }
      handleChangeSuccess && handleChangeSuccess(undefined, undefined);
    }
    const { hasNewLine, ids } = withDrawConfig || {};
    const originData = JSON.parse(JSON.stringify(data));

    let newData = cloneDeep(data);
    const idMap = new Map();
    changeData.forEach((d) => {
      const { field, value, row, id, extra, parentId } = d;
      if (parentId) {
        const parentRow = newData.find((item: any) => item.id === parentId);

        if (parentRow) {
          const child = parentRow.children.find((item: any) => item.id === id);
          if (child) {
            child[field] = value;
          } else {
            // console.log('子行的回滚');
            // 没有child 说明的删除的回滚
            // eslint-disable-next-line no-lonely-if
            if (withDrawConfig) {
              const { type } = withDrawConfig;
              if (type === 4) {
                parentRow.children.splice(row, 0, {} as any);
                parentRow.children[row] = {
                  ...newData[row],
                  ...(extra as object),
                } as ExcelTableType.RecordData<Record<string, unknown>>;
              }
            }
          }
        } else {
          // 不可能走到这，父行才能新增
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        let actualRow = -1;
        if (id < 0) {
          // 只可能是再末尾添加,然后默认参数自定
          if (!idMap.has(id)) {
            const newId = Math.random();
            idMap.set(id, newId);
            newData.push({ id: newId });
          }
          actualRow = newData.length - 1;
        } else {
          actualRow = newData.findIndex((item: any) => item.id === id);
        }

        if (field && actualRow >= 0) {
          newData[actualRow][field] = value;
        }
        // 撤销删除的逻辑
        if (withDrawConfig) {
          const { type } = withDrawConfig;
          if (type === 4) {
            newData.splice(row, 0, {} as any);
            newData[row] = {
              ...newData[row],
              ...(extra as object),
            } as ExcelTableType.RecordData<Record<string, unknown>>;
          }
        }

        // if (!newData[actualRow]) {
        //   newData[row] = { id };
        // } else if (extra) {
        //   newData.splice(row, 0, {} as any);
        // }
        // if (field) {
        //   newData[row][field] = value;
        // }
        // if (extra) {
        //   newData[row] = {
        //     ...newData[row],
        //     ...(extra as object),
        //   } as ExcelTableType.RecordData<Record<string, unknown>>;
        // }
      }
    });
    if (hasNewLine) {
      newData = newData
        .map((item: any) => {
          if (item.children) {
            return {
              ...item,
              children: item.children?.filter(
                (d: any) => !ids?.includes(d.id as unknown as string),
              ),
            };
          }
          return item;
        })
        .filter((d: any) => !ids?.includes(d.id as unknown as string));
    }

    setData(newData);
    handleChangeSuccess && handleChangeSuccess(originData, newData);
  };

  const handleAdd = (operateInfoGet?: any) => {
    const newId = Math.random();
    const newData = [...data, { id: newId, index: data.length }];
    setData(newData);

    operateInfoGet && operateInfoGet([{}], [newId]);
  };
  useEffect(() => {
    setTimeout(() => {
      if (tableCollectorRef.current) {
        // message.success(
        //   'ref loaded;I collect something,you can ctrl + z to see this',
        // );
        tableCollectorRef.current.collectCustomOperate({
          shit: 'I collect something,you can ctrl + z to see this',
          type: 'timeout',
        });
      }
    }, 2000);
  }, []);

  const handleFill = useCallback(
    (fillMode: 1 | 2 | 3, currentCellData: ExcelTableType.CellKeyInfo) => {
      const oldData = cloneDeep(data);
      if (fillMode === 3) {
        const newData = oldData.map((row: any) => ({
          ...row,
          [currentCellData.field]: currentCellData.value,
        }));
        setData(newData);
        tableCollectorRef.current?.collectCustomOperate({
          shit: oldData,
          type: 'fill',
        });
      }
    },
    [data],
  );

  return (
    <>
      <p>this is a demo for data sheet.</p>
      <Example
        freePaste
        withDrawRef={tableCollectorRef}
        columns={columns}
        data={data}
        onChange={handleChange}
        handleFill={handleFill}
        handleAdd={handleAdd}
        rowClassName={(rowData, index) => {
          if (index === 0) {
            return 'special';
          }
          return '';
        }}
      />
      {/* <Example columns={columns} data={[...data, ...data]} onChange={handleChange} handleFill={handleFill} />; */}
    </>
  );
};

export default Demo;
