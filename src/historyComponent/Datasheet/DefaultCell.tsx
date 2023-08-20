const DefaultCell = (props: {
  cell: DataSheetType.Cell;
  row: number;
  col: number;
  attributesRenderer?: DataSheetType.AttributesRenderer;
  className: string;
  style: Record<string, string>;
  onMouseDown: (event: any) => void;
  onMouseOver: (event: any) => void;
  onDoubleClick: (event: any) => void;
  onContextMenu: (event: any) => void;
  children: React.ReactElement;
}) => {
  const {
    cell,
    row,
    col,
    attributesRenderer,
    className,
    style,
    onMouseDown,
    onMouseOver,
    onDoubleClick,
    onContextMenu,
    children,
  } = props;

  const { colSpan, rowSpan } = cell;
  const attributes = attributesRenderer
    ? attributesRenderer(cell, row, col)
    : {};

  return (
    <td
      className={className}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onDoubleClick={onDoubleClick}
      onTouchEnd={onDoubleClick}
      onContextMenu={onContextMenu}
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
