import { useEffect, useRef, useState } from 'react';
import { dataSourceToRowConfig } from './util';

export const useGroupConfig = (
  dataSource: Record<string, unknown>[],
  tableGroupConfig?: Table.TableGroupConfig,
  hasChildren?: boolean,
) => {
  const [groupConfig, setGroupConfig] = useState<Sheet.RowGroupConfig>();
  const groupConfigRef = useRef<Sheet.RowGroupConfig>();
  useEffect(() => {
    if (!hasChildren) return;

    const rowConfig = dataSourceToRowConfig(
      dataSource,
      tableGroupConfig?.defaultOpen,
    );
    if (groupConfigRef.current) {
      groupConfigRef.current.groups.forEach(({ groupName }, index) => {
        const rowIndex = rowConfig.groups.findIndex(
          (item) => item.groupName == groupName,
        );
        rowConfig.groupOpen[rowIndex] =
          groupConfigRef.current?.groupOpen[index] ||
          rowConfig.groupOpen[rowIndex];
      });
    }

    setGroupConfig(rowConfig);
    groupConfigRef.current = rowConfig;
  }, [dataSource, hasChildren]);

  return [groupConfig, setGroupConfig] as [
    Sheet.RowGroupConfig,
    (value: Sheet.RowGroupConfig) => void,
  ];
};
