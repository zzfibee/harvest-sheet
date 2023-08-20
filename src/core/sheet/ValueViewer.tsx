const ValueViewer: Sheet.CellViewer = ({ value }) => (
  <span className="value-viewer">{value as string}</span>
);
export default ValueViewer;
