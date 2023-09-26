import type { SheetTableType, SheetType } from '@zhenliang/sheet/type';
import { flatten, isNil } from 'lodash';
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
    const rowConfig = dataSourceToRowConfig(
      dataSource,
      tableGroupConfig?.defaultOpen,
    );
    if (groupConfigRef.current) {
      rowConfig.groups.forEach(
        (
          { groupName, groupStart: newGroupStart, groupEnd: newGroupEnd },
          index,
        ) => {
          const rowIndex =
            groupConfigRef.current?.groups.findIndex(
              (item) => item.groupName === groupName,
            ) ?? -1;
          if (rowIndex >= 0) {
            let hasNewLine = false;
            const currentOld = groupConfigRef.current?.groups[rowIndex];
            if (
              currentOld &&
              !isNil(currentOld.groupEnd) &&
              !isNil(currentOld.groupStart)
            ) {
              const oldLength = currentOld.groupEnd - currentOld.groupStart;
              const newLength = newGroupEnd - newGroupStart;
              hasNewLine = newLength > oldLength;
            } else {
              hasNewLine = true;
            }

            rowConfig.groupOpen[index] = hasNewLine
              ? true
              : (groupConfigRef.current?.groupOpen[rowIndex] as boolean);
          } else {
            // 新子行
            rowConfig.groupOpen[index] = true;
          }
        },
      );
    }

    setGroupConfig(rowConfig);
    groupConfigRef.current = rowConfig;
  }, [dataSource.length, childrenLength, hasChildren]);

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
