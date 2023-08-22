import Table from '../core/table';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  {
    title: 'Address',
    readonly: (value: unknown, record: any, index: number) => {
      console.log(index);
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
    render: (props: any) => <a>Delete</a>,
  },
];

const data = [
  {
    key: 1,
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    children: [{ key: '1-1' }, { key: '1-2' }],
  },
  {
    key: 2,
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    children: [{ key: '2-1' }, { key: '2-2' }],
  },
  {
    key: 3,
    name: 'Not Expandable',
    age: 29,
    address: 'Jiangsu No. 1 Lake Park',
  },
  {
    key: 4,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    children: [{ key: '4-1' }, { key: '4-2' }],
  },
];

const App: React.FC = () => (
  <Table
    draggable
    scroll={{ x: '100%' }}
    columns={columns}
    // expandable={{
    //   expandedRowRender: (record) => (
    //     <p style={{ margin: 0 }}>{record.description}</p>
    //   ),
    //   rowExpandable: (record) => record.name !== 'Not Expandable',
    // }}
    dataSource={data}
    onChange={() => {}}
  />
);

export default App;
