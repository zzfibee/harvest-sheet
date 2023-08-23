import type { SheetType } from '@zhenliang/sheet/type';
import { InputNumber as AntInputNumber } from 'antd';
import 'antd/es/input-number/style/index.css';
import { useEffect, useRef } from 'react';
import './index.less';

export const NumberEditor: SheetType.CellEditor = (props) => {
  const { value, onChange } = props;
  const inputNumberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputNumberRef?.current?.focus();
  }, []);

  return (
    <AntInputNumber
      ref={inputNumberRef}
      controls={false}
      className="number-editor"
      onMouseDown={(e) => e.stopPropagation()}
      value={value as number}
      addonAfter="%"
      onChange={onChange}
    />
  );
};
