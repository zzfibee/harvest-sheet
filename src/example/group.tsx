import { cloneDeep } from 'lodash';
import { useCallback, useState } from 'react';
import Table from '../core/table';
import { SheetTableType } from '../type';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  {
    title: 'Address',
    readonly: (value: unknown, record: any, index: number) => {
      // console.log(index);
      return index % 2 === 0;
    },
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    editable: false,
    render: () => <a>Delete</a>,
  },
];

const data = [
  {
    key: 1,
    id: 1,
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    children: [
      { id: 11, key: '1-1' },
      { id: 12, key: '1-2' },
    ],
  },
  {
    key: 2,
    id: 2,
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    children: [
      { id: 21, key: '2-1' },
      { id: 22, key: '2-2' },
    ],
  },
  {
    key: 3,
    id: 3,
    name: 'Not Expandable',
    age: 29,
    address: 'Jiangsu No. 1 Lake Park',
  },
  {
    key: 4,
    id: 4,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    children: [
      { id: 41, key: '4-1' },
      { id: 42, key: '4-2' },
    ],
  },
];

const App: React.FC = () => {
  const [state, setState] = useState(data);

  const handleChange = useCallback(
    (
      changes: SheetTableType.TableChange[],
      extChange?: SheetTableType.TableChange[],
    ) => {
      // console.log(extChange);
      const newState: any = cloneDeep(state);
      changes.forEach((change) => {
        const { row, key, value } = change;
        newState[row][key] = value;
      });
      setState(newState);
    },
    [state],
  );
  return (
    <Table
      draggable
      scroll={{ x: '100%' }}
      columns={columns}
      showBackEdit
      backEditStyle={{
        marginLeft: '10px',
        bottom: '5px',
        right: '5px',
      }}
      // expandable={{
      //   expandedRowRender: (record) => (
      //     <p style={{ margin: 0 }}>{record.description}</p>
      //   ),
      //   rowExpandable: (record) => record.name !== 'Not Expandable',
      // }}
      dataSource={data}
      onChange={handleChange}
    />
  );
};

export default App;
