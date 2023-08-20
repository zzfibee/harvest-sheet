import classNames from 'classnames';
import { memo } from 'react';

const Row = memo(
  (renderRowProps: {
    row: number;
    children: React.ReactNode;
    cells: any;
    rowClassName?: (rowData: any, rowIndex: number) => string;
  }) => {
    const { children, row, cells, rowClassName } = renderRowProps;
    const className = classNames(
      'data-grid',
      'row',
      rowClassName?.(cells, row),
    );
    return (
      <tr key={row} className={className}>
        {children}
      </tr>
    );
  },
);

export default Row;
