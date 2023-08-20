import {
  MinusOutlined as UnCollapse,
  PlusOutlined as Collapse,
} from '@harvest/sheet/svgs';
import classNames from 'classnames';
import { useCallback, useMemo, useRef } from 'react';

import { columnsFormatting } from './helper';

const HeaderCollapsed = ({ collapsed }: { collapsed?: boolean }) =>
  collapsed ? <UnCollapse /> : <Collapse />;
export const CollapsedWrapper = ({
  collapsed,
  handleCollapse,
  children,
}: {
  handleCollapse?: (open: boolean) => void;
  collapsed?: boolean;
  children?: any;
}) => (
  <div
    // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
    style={{ position: 'relative', textAlign: 'center', cursor: 'pointer' }}
    onClick={() => handleCollapse && handleCollapse(!collapsed)}
  >
    <div
      className="can-operate-elements"
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        left: 0,
      }}
    >
      <HeaderCollapsed collapsed={collapsed} />
    </div>
    {children}
  </div>
);

const Header = ({
  className,
  columns: originColumns,
  handleCollapse,
  collapsed,
}: {
  className: string;
  columns: ExcelTableType.ColumnsType[];
  handleCollapse?: (open: boolean) => void;
  collapsed?: boolean;
}) => {
  const items = useMemo(() => {
    const columns = columnsFormatting(originColumns);
    return columns.map((col: ExcelTableType.HeaderColumn, index: number) => {
      const { headerCellClassName, width, label, isSegmentTitle } = col;
      return (
        <th
          key={index}
          className={classNames(`cell read-only`, headerCellClassName)}
          style={{ width }}
        >
          {isSegmentTitle ? (
            <CollapsedWrapper
              handleCollapse={handleCollapse}
              collapsed={collapsed}
            >
              <span>{label}</span>
            </CollapsedWrapper>
          ) : (
            <span>{label}</span>
          )}
        </th>
      );
    });
  }, [originColumns]);

  return (
    <table key="header" className={classNames(className, 'header')}>
      <thead>
        <tr className={classNames(className)}>{items}</tr>
      </thead>
    </table>
  );
};

const useShell = (
  columns: ExcelTableType.ColumnsType[],
  calcBodyTop: () => number,
  handleCollapse?: (expandAll: boolean) => void,
  collapsed?: boolean,
) => {
  const columnsRef = useRef(columns);

  columnsRef.current = useMemo(() => columns, [columns]);

  const renderShell = useCallback(
    ({
      children,
      className,
    }: {
      className: string;
      children: React.ReactNode;
    }) => {
      const bodyTop = calcBodyTop();
      return (
        <>
          <Header
            className={className}
            columns={columnsRef.current}
            handleCollapse={handleCollapse}
            collapsed={collapsed}
          />
          <table
            key="body"
            className={classNames(className, 'body')}
            style={{ top: `${bodyTop}px` }}
          >
            <tbody key="tbody">{children}</tbody>
          </table>
        </>
      );
    },
    [collapsed, handleCollapse],
  );

  return renderShell;
};

export default useShell;
