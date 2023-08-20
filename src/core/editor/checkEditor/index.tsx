import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useCallback } from 'react';

export const CheckViewer: Sheet.CellViewer = (props) => {
  const { value } = props;
  const handleChange = useCallback((e: CheckboxChangeEvent) => {
    // onChange(e.target.checked);
  }, []);
  return <Checkbox checked={value as boolean} onChange={handleChange} />;
};
