import { Modal } from 'antd';
import React, { useState } from 'react';
import {
  DateEditor,
  getCascaderEditor,
  getNumberEditor,
  getSelectEditor,
} from '../core/editor';
import {} from '../core/editor/numberEditor';
import Table from '../core/table';
import { BtnViewer } from '../core/viewer/btnViewer';
import { EditViewer } from '../core/viewer/editViewer';
import { SwitchViewer } from '../core/viewer/switchViewer';
import { SheetTableType } from '../type';

const Precision2MoneyEditor = getNumberEditor({
  max: 1000,
  min: 0,
  precision: 2,
  addonAfter: '元',
});
const Precision2Number = getNumberEditor({
  max: 1000,
  min: 0,
  precision: 2,
});

const TypeSelector = getSelectEditor([
  {
    value: '1',
    label: '111111',
  },
  {
    value: '2',
    label: '222222',
  },
  {
    value: '3',
    label: '333333',
  },
]);

const CascaderSelector = getCascaderEditor([
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
]);

const columns: SheetTableType.ColumnProps[] = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'open',
    key: 'open',
    fixed: 'left',
    render: SwitchViewer,
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    editor: Precision2Number,
    readonly: (value, record, row) => row === 1,
    // fixed: 'left',
  },
  {
    title: 'price',
    width: 100,
    dataIndex: 'price',
    key: 'price',
    editor: Precision2MoneyEditor,
    readonly: (value, record, row) => row === 1,
    // fixed: 'left',
  },
  {
    title: 'date',
    width: 150,
    dataIndex: 'date',
    key: 'date',
    editor: DateEditor,
    // fixed: 'left',
  },
  {
    title: 'select',
    width: 200,
    dataIndex: 'select',
    editor: TypeSelector,
  },
  {
    title: 'Column 2',
    width: 200,
    dataIndex: 'address1',
    key: '2',
    editor: CascaderSelector,
  },
  {
    title: 'Column 3',
    width: 200,
    dataIndex: 'address2',
    key: '3',
    editable: false,
    render: EditViewer,
  },
  { title: 'Column 4', width: 200, dataIndex: 'address3', key: '4' },
  { title: 'Column 5', width: 200, dataIndex: 'address4', key: '5' },
  { title: 'Column 6', width: 200, dataIndex: 'address5', key: '6' },
  { title: 'Column 7', width: 200, dataIndex: 'address6', key: '7' },
  { title: 'Column 8', width: 200, dataIndex: 'address7', key: '8' },
  {
    title: 'Action',
    align: 'center',
    key: 'operation',
    fixed: 'right',
    width: 150,
    render: BtnViewer,
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    date: '2020-01-01',
    open: true,
    age: 32,
    address1: 'West Lake',
    address2: '打开对话框1',
    select: '111111',
    address: 'New York Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    open: false,
    date: '1990-01-01',
    address2: '打开对话框2',
    age: 40,
    select: '222222',
    address: 'London Park',
  },
];

const App: React.FC = () => {
  const [state, setState] = useState(data);
  return (
    <Table
      columns={columns}
      dataSource={state}
      scroll={{ x: '100%' }}
      onChange={() => {}}
      eventHandler={{
        'cell-edit': (value: unknown) => {
          const { row, value: cellValue } = value as {
            row: number;
            record: Record<string, unknown>;
            value: unknown;
          };
          Modal.confirm({
            title: `${row} - ${cellValue}编辑点什么`,
          });
        },
        'btn-click': (value: unknown) => {
          const { row, type } = value as {
            row?: number;
            type: 'copy' | 'delete';
          };
          Modal.confirm({
            title: `${row} - ${type}提示点什么`,
          });
        },
        'cell-switch': (value: unknown) => {
          const { row, value: cellValue } = value as {
            row: number;
            record: Record<string, unknown>;
            value: unknown;
          };
          const newState = [...state];
          newState[row] = {
            ...newState[row],
            open: !cellValue,
          };

          setState(newState);
        },
      }}
    />
  );
};

export default App;
