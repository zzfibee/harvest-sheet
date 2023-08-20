import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useSheetEvent } from '@zsheet/zsheet/hooks';

import { useCallback } from 'react';

export const GroupViewer: Sheet.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleChange = useCallback(() => {
    if (!eventBus) return;
    eventBus.emit('group-open', { row });
  }, [eventBus, row]);
  if (value) {
    return (
      <span onClick={handleChange}>
        {!record.open ? <PlusSquareOutlined /> : <MinusSquareOutlined />}
      </span>
    );
  }
  return <span></span>;
};
