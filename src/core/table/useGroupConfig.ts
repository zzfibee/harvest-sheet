import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { useEffect, useRef, useState } from 'react';
import { dataSourceToRowConfig } from './util';

export const useGroupConfig = (
  dataSource: Record<string, unknown>[],
  tableGroupConfig?: SheetTableType.TableGroupConfig,
  hasChildren?: boolean,
) => {
  const [groupConfig, setGroupConfig] = useState<SheetType.RowGroupConfig>();
  const groupConfigRef = useRef<SheetType.RowGroupConfig>();
  useEffect(() => {
    if (!hasChildren) return;

    const rowConfig = dataSourceToRowConfig(
      dataSource,
      tableGroupConfig?.defaultOpen,
    );
    if (groupConfigRef.current) {
      groupConfigRef.current.groups.forEach(({ groupName }, index) => {
        const rowIndex = rowConfig.groups.findIndex(
          (item) => item.groupName === groupName,
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
    SheetType.RowGroupConfig,
    (value: SheetType.RowGroupConfig) => void,
  ];
};
