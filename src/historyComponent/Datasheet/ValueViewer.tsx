const ValueViewer = ({
  cell,
  row,
  column,
  value,
}: {
  cell: DataSheetType.Cell;
  row: number;
  column: number;
  value?: string;
}) => <span className="value-viewer">{value}</span>;
export default ValueViewer;
