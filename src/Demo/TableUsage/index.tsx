import { CascaderEditor } from '@zsheet/zsheet/core/editor/cascaderEditor';
import { DateEditor } from '@zsheet/zsheet/core/editor/dateEditor';
import { NumberEditor } from '@zsheet/zsheet/core/editor/numberEditor';
import { GetSelectEditor } from '@zsheet/zsheet/core/editor/selectEditor';
import { range } from 'lodash';
import React, { useState } from 'react';
import Table from '../../core/table';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left' as Table.CellFixed,
    width: 150,
    align: 'center' as Table.CellAlign,
  },

  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 300,
    editor: NumberEditor,
    align: 'left' as Table.CellAlign,
  },
  {
    title: 'type',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    align: 'left' as Table.CellAlign,
    editor: GetSelectEditor([
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
    ]),
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: 400,
    key: 'address',
    align: 'left' as Table.CellAlign,
  },
  {
    title: 'Address1',
    dataIndex: 'address1',
    width: 400,
    key: 'address1',
    align: 'left' as Table.CellAlign,
    editor: DateEditor,
  },
  {
    title: 'Address2',
    dataIndex: 'address2',
    width: 400,
    key: 'address2',
    editor: CascaderEditor,
    align: 'left' as Table.CellAlign,
  },
  {
    title: 'Tags',
    key: 'tags',
    fixed: 'right' as Table.CellFixed,
    width: 130,
    dataIndex: 'tags',
    align: 'right' as Table.CellAlign,
  },
];
let dataSource = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
    type: 1,
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
    type: 2,
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
    type: 3,
  },
];
dataSource = range(100).map((item, index) => ({ ...dataSource[index % 3] }));

const TableUsage: React.FC = () => {
  const [data, setState] = useState<Record<string, unknown>[]>(dataSource);

  const onCellsChanged = (changes: Table.TableChange[]) => {
    let newData: Record<string, unknown>[] = [...data];
    changes.forEach(({ row, id, key, value }) => {
      newData[row][key] = value;
    });
    setState(newData);
  };

  return (
    <Table
      dataSource={data}
      scroll={{ x: '400px', y: '100%' }}
      columns={columns}
      onChange={onCellsChanged}
    />
  );
};

export default TableUsage;
