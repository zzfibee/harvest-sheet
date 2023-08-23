import { useMemo } from 'react';
import { classNames } from './util';

export const WrapperShell = ({
  columns,
  className,
}: {
  columns: SheetTable.ColumnProps[];
  className: string;
}) => {
  const TableShell: React.FC<{
    children: React.ReactElement;
  }> = ({ children }) => {
    const { thItems, colItems } = useMemo(() => {
      const thItems = columns.map((item: SheetTable.ColumnProps) => (
        <th
          className="cell read-only"
          key={item.dataIndex}
          style={{ width: item.width ?? 'unset' }}
        >
          {item.title}
        </th>
      ));
      const colItems = columns.map((item: SheetTable.ColumnProps) => (
        <col
          className="cell"
          key={item.dataIndex}
          style={{ width: item.width ?? 'unset' }}
        />
      ));

      return {
        thItems,
        colItems,
      };
    }, [columns]);
    return (
      <>
        <table
          key="header"
          className={classNames('header', 'harvest-sheet', className)}
        >
          <thead>
            <tr>{thItems}</tr>
          </thead>
        </table>
        <table key="body" className={classNames('body', 'harvest-sheet')}>
          <colgroup>{colItems}</colgroup>
          <tbody key="tbody">{children}</tbody>
        </table>
      </>
    );
  };
  return TableShell;
};
