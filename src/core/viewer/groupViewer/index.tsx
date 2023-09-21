import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useSheetEvent } from '@zhenliang/sheet';
import type { SheetType } from '@zhenliang/sheet/type';

import { useCallback } from 'react';

export const GroupViewer: SheetType.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleChange = useCallback(() => {
    if (!eventBus) return;

    if (record?.isHeader) {
      eventBus.emit('group-open-title', !record?.open);
    } else {
      eventBus.emit('group-open', { row, open: record?.open });
    }
  }, [eventBus, row, record?.open]);
  if (value) {
    return (
      <span
        style={{ cursor: 'pointer' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleChange}
      >
        {!record?.open ? <PlusSquareOutlined /> : <MinusSquareOutlined />}
      </span>
    );
  }
  return <span></span>;
};
