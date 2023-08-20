import { classNames } from '../util';

const DefaultCell = (props: {
  cell: Sheet.Cell;
  row: number;
  col: number;
  attributesRenderer?: Sheet.AttributesRenderer;
  className: string;
  style: Record<string, string>;
  children: React.ReactElement;
}) => {
  const { cell, row, col, attributesRenderer, className, style, children } =
    props;

  const { colSpan, rowSpan } = cell;
  const attributes = attributesRenderer
    ? attributesRenderer(cell, row, col)
    : {};

  return (
    <td
      data-row={row}
      data-col={col}
      className={classNames(
        className,
        cell.fixed && 'fixed',
        cell.fixed && `fixed-${cell.fixed}`,
      )}
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={style}
      {...attributes}
    >
      {children}
    </td>
  );
};

export default DefaultCell;
