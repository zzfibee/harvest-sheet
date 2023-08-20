import { useMemo, useRef } from 'react';
import { classNames } from '../util';
import './draggableShell/index.less';

export const TableShell = ({
  columns,
  className,
  hasControl = false,
  controlWidth = 25,
}: {
  columns: Table.ColumnProps[];
  className: string;
  hasControl?: boolean;
  controlWidth?: number;
}) => {
  const TableShell: React.FC<{
    children: React.ReactElement;
  }> = ({ children }) => {
    const downRef = useRef<
      | (HTMLTableHeaderCellElement & {
          mouseDown?: boolean;
          oldX?: number;
          oldWidth?: number;
          width?: string;
        })
      | null
    >(null);

    const thItems = useMemo(() => {
      const ths = [];
      if (hasControl) {
        ths.push(<th className="cell cell-title read-only sheet-control"></th>);
      }

      columns.forEach((item: Table.ColumnProps, index) => {
        ths.push(
          <th
            className={classNames(
              'cell',
              'cell-title',
              'read-only',
              item.fixed && 'fixed',
              item.fixed && `fixed-${item.fixed}`,
            )}
            key={item.dataIndex || index}
            style={{
              textAlign: (item.align as any) ?? 'unset',
              left: item.fixed === 'left' ? 0 : 'unset',
              right: item.fixed === 'right' ? 0 : 'unset',
            }}
          >
            {item.title}
          </th>,
        );
      });
      return ths;
    }, [columns, hasControl]);

    const colItems = useMemo(() => {
      const cols = [];
      if (hasControl) {
        cols.push(
          <col
            className={classNames('sheet-control')}
            key="sheet-control"
            style={{
              width: controlWidth,
            }}
          />,
        );
      }
      columns.forEach((item: Table.ColumnProps, index) => {
        cols.push(
          <col
            className={classNames('cell')}
            key={item.dataIndex || index}
            style={{
              width: item.width || 'unset',
            }}
          />,
        );
      });
      return cols;
    }, [columns, hasControl, controlWidth]);

    return (
      <>
        <table
          key="header"
          className={classNames('header', 'harvest-sheet', className)}
          style={{ position: 'sticky', top: 0, zIndex: 3 }}
        >
          <colgroup>{colItems}</colgroup>
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
