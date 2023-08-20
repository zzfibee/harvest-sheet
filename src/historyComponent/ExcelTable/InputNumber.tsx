import { InputNumber } from 'antd';
import { useEffect, useRef } from 'react';

import { thousandsSeparator } from '@harvest/sheet/standardUtils';

const InputForNumber = (props: {
  value: number;
  onCommit: (value: string | number | null, e?: Event) => void;
  onRevert: () => void;
  onKeyDown: (e: any) => void;
  onChange: (value: string | number | null, e?: Event) => void;
  cell: {
    addonAfter?: string;
    precision?: number;
    value: number;
  };
}) => {
  const {
    value,
    onCommit,
    onChange,
    onRevert,
    onKeyDown,
    cell: { addonAfter, precision = 2, value: cellValue },
  } = props;
  const valueRef = useRef<number | string | undefined>(value || cellValue);
  const inputNumberRef = useRef<any>();

  const handlePrecision = (v?: number | string | null) => {
    let vl = v;
    if (vl) {
      const valueArr = String(vl).split('.');
      if (valueArr.length === 2) {
        const [integer, decimal] = valueArr;
        vl = integer;
        if (precision) {
          vl += `.${decimal.slice(0, precision)}`;
        }
      }
    }
    return vl as number;
  };

  useEffect(() => {
    inputNumberRef?.current?.focus();
  }, []);

  const handleFormat = (v?: string | number | undefined) => {
    let vl: number | string = handlePrecision(v);
    vl = thousandsSeparator(vl);

    return vl;
  };

  const handleParse = (v?: string | number) => {
    valueRef.current = v;
    if (v) {
      valueRef.current = (v as string).replace(/,/g, '');
    }
    return valueRef.current as number;
  };

  const handleKey = (e: any) => {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 27) {
      onRevert();
    } else if (keyCode === 13 || keyCode === 9) {
      onCommit(valueRef.current as any, e);
    } else {
      if (keyCode === 40 || keyCode === 38) {
        e.preventDefault();
        e.stopPropagation();
      }
      onKeyDown(e);
    }
  };
  return (
    <InputNumber
      ref={inputNumberRef}
      className="data-editor"
      value={value}
      addonAfter={addonAfter}
      controls={false}
      formatter={handleFormat}
      parser={handleParse}
      onChange={onChange}
      onKeyDown={handleKey}
    />
  );
};

export default InputForNumber;
