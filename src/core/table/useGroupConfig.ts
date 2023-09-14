import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { flatten } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dataSourceToRowConfig } from './util';

export const useGroupConfig = (
  dataSource: Record<string, unknown>[],
  tableGroupConfig?: SheetTableType.TableGroupConfig,
  hasChildren?: boolean,
) => {
  const [groupConfig, setGroupConfig] = useState<SheetType.RowGroupConfig>();
  const groupConfigRef = useRef<SheetType.RowGroupConfig>();
  const childrenLength = useMemo(() => {
    if (!dataSource?.length) return 0;
    const data = dataSource as (Record<string, unknown> & {
      children: Array<unknown>;
    })[];
    const childrenCount = flatten(
      data
        .filter((item) => !!(item.children as Array<unknown>)?.length)
        .map((item) => item.children),
    ).length;
    return childrenCount;
  }, [dataSource]);
  useEffect(() => {
    if (!hasChildren) return;

    console.log('groupConfigEffect', dataSource.length);
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
    console.log('groupConfigEffect', rowConfig.groups, rowConfig.groupOpen);
    groupConfigRef.current = rowConfig;
  }, [dataSource.length, childrenLength, hasChildren]);
  console.log('groupConfigEffect', dataSource.length, childrenLength);

  const handleGroupChange = useCallback(
    (value: SheetType.RowGroupConfig) => {
      setGroupConfig(value);
      groupConfigRef.current = value;
    },
    [setGroupConfig],
  );

  return [groupConfig, handleGroupChange] as [
    SheetType.RowGroupConfig,
    (value: SheetType.RowGroupConfig) => void,
  ];
};
