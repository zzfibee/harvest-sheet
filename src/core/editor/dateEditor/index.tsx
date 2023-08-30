import { DatePicker, DatePickerProps } from 'antd';
import 'antd/es/date-picker/style/index.css';

import type { SheetType } from '@zhenliang/sheet/type';
import moment from 'moment';
import { useEffect, useMemo, useRef } from 'react';
import './index.less';

export const GetDateEditor = (
  dateProps?: Pick<
    DatePickerProps,
    'disabledDate' | 'disabled' | 'allowClear' | 'placeholder'
  >,
) => {
  const DateEditor: SheetType.CellEditor = (props) => {
    const { value, onChange, onConfirm } = props;
    const dateRef = useRef<any>(null);

    useEffect(() => {
      dateRef?.current?.focus();
    }, []);

    const val = useMemo(() => value && moment(value as string), [value]);

    const handleChange = (value: any) => {
      onChange(value?.format('YYYY-MM-DD'));
      onConfirm(value?.format('YYYY-MM-DD'));
    };

    return (
      <DatePicker
        open
        ref={dateRef}
        className="date-editor"
        value={val as any}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={handleChange}
        {...dateProps}
      />
    );
  };

  DateEditor.checker = (value) => {
    const reg =
      /^[1-9]\d{3}(-|\/)(0[1-9]|1[0-2])(-|\/)(0[1-9]|[1-2][0-9]|3[0-1])$/;
    return reg.test(value as string);
  };

  DateEditor.formatter = (value) => {
    if (!DateEditor?.checker?.(value)) return null;
    return (value as string).replace('/', '-').replace('/', '-');
  };

  return DateEditor;
};
