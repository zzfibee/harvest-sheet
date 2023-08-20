import { useEffect, useMemo, useRef, useState } from 'react';

import { DatePicker } from 'antd';
import dayjs from 'dayjs';

import './index.less';

const DatePickerEditor = (props: any) => {
  const {
    value,
    onCommit,
    cell: { disabledDate },
  } = props;
  const [open, setOpen] = useState<boolean>(false);

  const datePickerRef = useRef<any>(null);
  const dateRef = useRef<any>(value);

  const handleDatePickerChange = (
    data: dayjs.Dayjs | null,
    dateString: string,
  ) => {
    dateRef.current = dateString;
    onCommit(dateString);
    setOpen(false);
  };

  const handleKeyDown = (event: any) => {
    const {
      code,
      target: { value: v },
    } = event;
    if (code === 'Enter') {
      handleDatePickerChange(null, v.replaceAll('/', '-'));
    }
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    dateRef.current = value;
  }, [value]);

  const val = useMemo(() => value && dayjs(value), [value]);

  return (
    <DatePicker
      popupClassName={'excelTablePopupClassName'}
      ref={datePickerRef}
      autoFocus
      showToday
      onMouseDown={(event: any) => {
        event.stopPropagation();
      }}
      disabledDate={disabledDate}
      value={val}
      onChange={handleDatePickerChange}
      format="YYYY-MM-DD"
      open={open}
      onKeyDown={handleKeyDown}
    />
  );
};
export default DatePickerEditor;
