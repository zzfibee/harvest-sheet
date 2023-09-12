import { SheetTableType } from '@zhenliang/sheet';
import { useEffect, useRef, useState } from 'react';

export const useRowSelection = (
  dataSource: Record<string, unknown>[],
  rowSelection?: SheetTableType.TableRowSelection,
  hasChildren?: boolean,
) => {
  const [checkedRow, setCheckedRow] = useState<boolean[]>(
    Array(dataSource?.length ?? 0).fill(false),
  );
  const checkedRowRef = useRef<boolean[]>(checkedRow);
  useEffect(() => {
    if (hasChildren || !rowSelection) return;
    const currentEmpty = Array(dataSource.length)
      .fill(false)
      .map((checked, index) => (checkedRowRef.current[index] ? true : false));
    setCheckedRow(currentEmpty);
    checkedRowRef.current = currentEmpty;
  }, [dataSource.length, hasChildren, rowSelection]);
  return [checkedRow, setCheckedRow] as [boolean[], (value: boolean[]) => void];
};
