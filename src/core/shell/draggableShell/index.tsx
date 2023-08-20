import { useEffect, useMemo, useRef } from 'react';
import { useSetState } from '../../../hooks';
import { classNames } from '../../util';
import './index.less';

export const DraggableShell = ({
  columns,
  className,
}: {
  columns: Table.ColumnProps[];
  className: string;
}) => {
  const TableShell: React.FC<{
    children: React.ReactElement;
  }> = ({ children }) => {
    const headRef = useRef<HTMLTableRowElement>(null);
    const downRef = useRef<
      | (HTMLTableHeaderCellElement & {
          mouseDown?: boolean;
          oldX?: number;
          oldWidth?: number;
          width?: string;
        })
      | null
    >(null);
    const [widths, setWidth] = useSetState<
      Record<number | string, string | number>
    >({});

    const thItems = useMemo(() => {
      return columns.map((item: Table.ColumnProps, index) => (
        <th
          className={classNames(
            'cell',
            'cell-title',
            'read-only',
            item.fixed && 'fixed',
            item.fixed && `fixed-${item.fixed}`,
          )}
          key={item.dataIndex ?? index}
          style={{
            textAlign: (item.align as any) ?? 'unset',
            left: item.fixed === 'left' ? 0 : 'unset',
            right: item.fixed === 'right' ? 0 : 'unset',
          }}
          onMouseDown={(e) => {
            const target = e.target as HTMLTableHeaderCellElement;

            downRef.current = target;
            if (e.nativeEvent.offsetX > target.offsetWidth - 10) {
              downRef.current.mouseDown = true;
              downRef.current.oldX = e.nativeEvent.x;
              downRef.current.oldWidth = downRef.current.offsetWidth;
            } else {
              downRef.current = null;
            }
          }}
          onMouseMove={(e) => {
            const target = e.target as HTMLTableHeaderCellElement;
            if (e.nativeEvent.offsetX > target.offsetWidth - 10) {
              target.style.cursor = 'col-resize';
            } else {
              target.style.cursor = 'default';
            }
            //取出暂存的Table Cell
            if (downRef.current == undefined) downRef.current = target;
            //调整宽度
          }}
        >
          {item.title}
        </th>
      ));
    }, [columns]);

    const colItems = useMemo(() => {
      return columns.map((item: Table.ColumnProps, index) => (
        <col
          className={classNames('cell')}
          key={item.dataIndex ?? index}
          style={{
            width: widths[index] || item.width || 'unset',
          }}
        />
      ));
    }, [widths, columns]);

    useEffect(() => {
      const handleMouseUp = (e: MouseEvent) => {
        //结束宽度调整
        if (downRef.current) {
          downRef.current.mouseDown = false;
          downRef.current.style.cursor = 'default';
        }
      };
      const handleMouseMove = (e: MouseEvent) => {
        if (!downRef.current || !downRef.current.mouseDown) return;

        if (
          downRef.current?.mouseDown !== null &&
          downRef.current?.mouseDown === true
        ) {
          downRef.current.style.cursor = 'default';
          if (
            (downRef.current.oldWidth ?? 0) +
              (e.x - (downRef.current.oldX ?? 0)) >
            0
          ) {
            let newWidth = Math.max(
              Number(
                (downRef.current.oldWidth ?? 0) +
                  (e.x - (downRef.current.oldX ?? 0)),
              ),
              50,
            );

            const cellList = ([] as any[]).slice.call(headRef.current?.cells);
            const changeIndex = cellList.indexOf(downRef.current);
            //调整该列中的每个Cell
            const widths = {
              length: columns.length,
              [changeIndex]: `${newWidth}px`,
            };

            setWidth(widths);
          }
        }
      };

      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }, []);
    return (
      <>
        <table
          key="header"
          className={classNames('header', 'harvest-sheet', className)}
          style={{ position: 'sticky', top: 0, zIndex: 3 }}
        >
          <colgroup>{colItems}</colgroup>
          <thead>
            <tr ref={headRef}>{thItems}</tr>
          </thead>
        </table>
        <table key="body" className={classNames('body', 'harvest-sheet')}>
          <colgroup className="header">{colItems}</colgroup>
          <tbody key="tbody">{children}</tbody>
        </table>
      </>
    );
  };
  return TableShell;
};
