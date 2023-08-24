import { useSheetEvent } from '@zhenliang/sheet/hooks';
import type { SheetType } from '@zhenliang/sheet/type';
import { Switch } from 'antd';
import { useCallback } from 'react';

export const SwitchViewer: SheetType.CellViewer = (props) => {
  const { value, row, record } = props;
  const eventBus = useSheetEvent();
  const handleChange = useCallback(() => {
    if (!eventBus) return;
    eventBus.emit('cell-switch', { row, record, value });
  }, [eventBus, row, record, value]);
  return <Switch checked={value as boolean} onChange={handleChange} />;
};
