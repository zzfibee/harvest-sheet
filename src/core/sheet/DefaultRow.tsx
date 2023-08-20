import { useMemo } from 'react';
import { groupConfigToGroupMap } from '../util';

const DefaultRow: React.FC<{
  children: React.ReactElement;

  row: number;
  groupConfig?: {
    groups: Sheet.RowGroup[];
    groupOpen: boolean[];
  };
}> = ({ children, row, groupConfig }) => {
  const groupMap = useMemo(() => {
    // 分组逻辑
    return groupConfigToGroupMap(groupConfig);
  }, [groupConfig]);

  if (
    groupMap.get(row) &&
    !groupMap.get(row)?.isStart &&
    !groupMap.get(row)?.isOpen
  ) {
    return <tr style={{ display: 'none' }}>{children}</tr>;
  }

  return <tr>{children}</tr>;
};
export default DefaultRow;
