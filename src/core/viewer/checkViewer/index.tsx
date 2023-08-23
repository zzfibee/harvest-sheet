import { useSheetEvent } from '@harvest/sheet/hooks';
import { Checkbox } from 'antd';
import { useCallback } from 'react';

export const CheckViewer: Sheet.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleChange = useCallback(() => {
    if (!eventBus) return;
    if (record?.isHeader) {
      eventBus.emit('row-select-title', record?.indeterminate ? false : true);
    } else {
      eventBus.emit('row-select', row);
    }
  }, [eventBus, row, record, value]);
  return (
    <Checkbox
      indeterminate={record?.indeterminate as boolean}
      checked={value as boolean}
      onChange={handleChange}
    />
  );
};
