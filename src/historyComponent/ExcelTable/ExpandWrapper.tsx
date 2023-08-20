import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ExcelTable from '.';
import { CollapsedWrapper } from './useShell';

type TableDataConfig = {
  parentRowLength: number;
  childrenLength: number[];
  parentIds: number[];
  parentCollapsed: boolean[];
};
const checkSameBoolean = (
  collapsed?: boolean[],
): { changed: boolean; value?: boolean } => {
  if (!collapsed) {
    return {
      changed: false,
    };
  }
  const allFalse = !collapsed.some((row) => row === true);
  const allTrue = !collapsed.some((row) => row === false);
  if (allFalse || allTrue) {
    return {
      changed: true,
      value: collapsed[0],
    };
  }
  return {
    changed: false,
  };
};

const ExpandWrapper = (props: ExcelTableType.ExcelTableProps) => {
  const {
    data,
    columns: originColumns,
    showExpand = false,
    defaultCollapsed = true,
    unlimitedPaste,
    onChange,
  } = props;

  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const [parentRow, setParentRow] = useState<number[]>();
  const [parentCollapsed, setParentCollapsed] = useState<boolean[]>();
  const dataConfig = useRef<TableDataConfig>({
    parentRowLength: 0,
    childrenLength: [],
    parentIds: [],
    parentCollapsed: [],
  });

  const expandColumns = useMemo(() => {
    if (!parentCollapsed?.length || !parentRow?.length) {
      return originColumns;
    }
    const [firstColumns, ...otherColumns] = originColumns;
    const expandColumn = {
      ...firstColumns,
      isSegmentTitle: !!parentRow.length,
    };
    expandColumn.component = (
      record,
      rowIndex,
      colIndex,
      operateInfosCollect,
    ) => {
      const index = parentRow.indexOf(record.id as number);
      const rowCollapsed = parentCollapsed[index];
      if (index >= 0) {
        return (
          <CollapsedWrapper
            collapsed={rowCollapsed}
            handleCollapse={(open) => {
              const newExpand = [...parentCollapsed];
              newExpand[index] = open;
              setParentCollapsed(newExpand);

              dataConfig.current = {
                ...dataConfig.current,
                parentCollapsed: newExpand,
              };

              const { changed, value } = checkSameBoolean(newExpand);
              if (changed) {
                setCollapsed(!!value);
              }

              operateInfosCollect &&
                operateInfosCollect(2, {
                  row: rowIndex,
                  infos: [
                    { row: index, collapsed: parentCollapsed, id: record.id },
                  ],
                  newIds: [],
                });
            }}
          >
            <span>{record[expandColumn.dataIndex]}</span>
          </CollapsedWrapper>
        );
      }
      return (
        <div style={{ textAlign: 'center' }}>
          {record[expandColumn.dataIndex]}
        </div>
      );
    };
    return [expandColumn, ...otherColumns];
  }, [originColumns, parentCollapsed, parentRow]);

  const expandData = useMemo(() => {
    if (!parentCollapsed || !parentRow) {
      return data;
    }
    const flatData: ExcelTableType.RecordData<Record<string, unknown>>[] = [];
    data.forEach((item) => {
      const index = parentRow.indexOf(item.id) ?? -1;
      flatData.push(item);
      if (item.children?.length && !parentCollapsed[index]) {
        item.children.forEach((child: any) => {
          flatData.push({ ...child, parentId: item.id });
        });
      }
    });
    return flatData;
  }, [parentCollapsed, parentRow, data]);

  const { parentRowLength, childrenLength, parentRowIds } = useMemo(() => {
    if (!data?.length) {
      return {
        parentRowLength: 0,
        childrenLength: [],
        parentRowIds: [],
      };
    }
    const parentRows = data.filter(
      (item) => item.children && (item.children as unknown[]).length,
    );
    const currentParentRowLength: number = parentRows.length;
    const currentChildrenLength: number[] = parentRows.map(
      (item) => item.children.length ?? 0,
    );
    return {
      parentRowLength: currentParentRowLength,
      childrenLength: currentChildrenLength,
      parentRowIds: parentRows.map((item) => item.id),
    };
  }, [data]);

  useEffect(() => {
    if (!data?.length || !originColumns.length || parentCollapsed) {
      return;
    }
    const parentRows = data.filter(
      (item) => item.children && (item.children as unknown[]).length,
    );
    const currentParentRowIds = parentRows.map((item) => item.id);

    const currentCollapsed = new Array(parentRows.length).fill(collapsed);

    dataConfig.current = {
      ...dataConfig.current,
      parentRowLength: parentRows.length,
      parentIds: currentParentRowIds,
      childrenLength,
      parentCollapsed: currentCollapsed,
    };

    setParentRow(currentParentRowIds);
    setParentCollapsed(currentCollapsed);
  }, [data, originColumns, collapsed, parentCollapsed]);

  useEffect(() => {
    if (parentRowLength !== dataConfig.current.parentRowLength) {
      if (parentRowLength < dataConfig.current.parentRowLength) {
        // 行删减
        let deleteIndex = 0;
        for (let i = 0; i < dataConfig.current.parentRowLength; i++) {
          if (parentRowIds[i] !== dataConfig.current.parentIds[i]) {
            deleteIndex = i;
            break;
          }
        }
        dataConfig.current.parentCollapsed.splice(deleteIndex, 1);
        setParentCollapsed(dataConfig.current.parentCollapsed);
        const { changed, value } = checkSameBoolean(parentCollapsed);
        if (changed) {
          setCollapsed(!!value);
        }
        setParentRow(parentRowIds);
      } else {
        // 行新增
        let firstIndex = 0;
        for (let i = 0; i < parentRowIds.length; i++) {
          if (parentRowIds[i] !== dataConfig.current.parentIds[i]) {
            firstIndex = i;
            break;
          }
        }

        dataConfig.current.parentCollapsed.splice(firstIndex, 0, false);
        setParentCollapsed(dataConfig.current.parentCollapsed);
        const { changed, value } = checkSameBoolean(
          dataConfig.current.parentCollapsed,
        );
        if (changed) {
          setCollapsed(!!value);
        }
        setParentRow(parentRowIds);
      }
      dataConfig.current = {
        ...dataConfig.current,
        parentRowLength,
        parentIds: parentRowIds,
        childrenLength,
      };
    } else {
      let childrenChange = false;
      const changed: number[] = [];
      dataConfig.current?.childrenLength?.forEach((item, index) => {
        if (childrenLength[index] !== item) {
          childrenChange = true;
          changed.push(index);
        }
      });
      if (childrenChange) {
        const currentParentCollapsed = [...dataConfig.current.parentCollapsed];
        currentParentCollapsed[changed[0]] = false;
        setParentCollapsed(currentParentCollapsed);
        const { changed: boolChanged, value } = checkSameBoolean(
          dataConfig.current.parentCollapsed,
        );
        if (boolChanged) {
          setCollapsed(!!value);
        }
        dataConfig.current = {
          ...dataConfig.current,
          parentRowLength,
          parentIds: parentRowIds,
          childrenLength,
        };
      }
    }
  }, [parentRowLength, childrenLength, parentRowIds]);

  const handleCollapsed = useCallback(
    (value?: boolean, part?: boolean[]) => {
      if (value !== undefined) {
        setCollapsed(value);
        setParentCollapsed(parentCollapsed?.map(() => value));
        dataConfig.current = {
          ...dataConfig.current,
          parentCollapsed: dataConfig.current.parentCollapsed.map(() => value),
        };
      }
      if (part !== undefined) {
        const { changed, value: checkBoolean } = checkSameBoolean(part);
        if (changed) {
          setCollapsed(!!checkBoolean);
        }
        setParentCollapsed(part);
        dataConfig.current = {
          ...dataConfig.current,
          parentCollapsed: part,
        };
      }
    },
    [parentCollapsed],
  );

  const onFlatChange: ExcelTableType.ExcelTableChange = useCallback(
    (
      changeData: {
        id: number;
        parentId?: number;
        row: number;
        col: number;
        field: string;
        value: ExcelTableType.CellValue;
        extra?: unknown;
      }[],
      handleChangeSuccess,
      withDrawConfig,
    ) => {
      let wrappedData =
        changeData?.map((item) => ({
          ...item,
          parentId:
            item.parentId ??
            Number(
              expandData.find((d) => String(d.id) === String(item.id))
                ?.parentId ?? 0,
            ),
          id: Number(item.id),
        })) || [];

      const isAllDelete = !wrappedData.some((item) => item.value);
      const isParentPaste = wrappedData.some((item) => !item.parentId);
      const isChildPaste = wrappedData.some((item) => item.parentId);
      const hasNewLine = wrappedData.some((item) => item.id < 0);

      if (unlimitedPaste) {
        if (isParentPaste && isChildPaste && hasNewLine) {
          wrappedData = wrappedData.filter((item) => !(item.id < 0));
        }
      } else if (!isAllDelete) {
        if (isChildPaste && hasNewLine) {
          // message.warn('黏贴范围需与复制范围保持一致');
          return;
        }
        if (isParentPaste && isChildPaste) {
          // message.warn('复制内容不能同时黏贴在主行及分段行');
          return;
        }
      }

      onChange && onChange(wrappedData, handleChangeSuccess, withDrawConfig);
    },
    [onChange, expandData],
  );
  return (
    <ExcelTable
      {...props}
      onChange={onFlatChange}
      data={expandData}
      columns={expandColumns}
      handleCollapse={handleCollapsed}
      collapsed={collapsed}
    />
  );
};
export default ExpandWrapper;
