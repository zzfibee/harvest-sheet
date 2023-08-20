import { useSheetEvent } from '@zsheet/zsheet/hooks';
import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useCallback } from 'react';

export const CheckViewer: Sheet.CellViewer = (props) => {
  const { value, row } = props;
  const eventBus = useSheetEvent();
  const handleChange = useCallback(
    (e: CheckboxChangeEvent) => {
      if (!eventBus) return;
      eventBus.emit('row-select', row);
    },
    [eventBus, row],
  );
  return <Checkbox checked={value as boolean} onChange={handleChange} />;
};
