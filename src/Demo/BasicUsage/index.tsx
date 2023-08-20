import { range } from 'lodash';
import Excel from '../../historyComponent/ExcelTable';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    cellType: 'text',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    cellType: 'text',
    width: 100,
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    cellType: 'text',
    width: 100,
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    cellType: 'text',
    dataIndex: 'tags',
  },
  {
    title: 'Action',
    key: 'action',
    cellType: 'text',
    dataIndex: 'action',
  },
];

let data = [
  {
    key: '1',
    id: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    id: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    id: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

data = range(500).map((item) => {
  const index = item % 3;
  return {
    ...data[index],
    key: String(item),
    id: String(item),
    name: data[index].name,
    age: 32,
  };
});

const App = () => {
  return <Excel columns={columns as any} data={data as any} />;
};

export default App;
