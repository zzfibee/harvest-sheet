import { formatPrecision } from '@zhenliang/sheet/standardUtils';
import type { SheetType } from '@zhenliang/sheet/type';
import { InputNumber as AntInputNumber, InputNumberProps } from 'antd';
import 'antd/es/input-number/style/index.css';
import { isNil } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
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

export const getNumberEditor = (
  extraProps?: Pick<
    InputNumberProps,
    'max' | 'min' | 'addonBefore' | 'addonAfter' | 'precision'
  >,
) => {
  const NumberEditor: SheetType.CellEditor = (props) => {
    const { value, onChange } = props;
    const inputNumberRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputNumberRef?.current?.focus();
    }, []);

    const { precision, ...inputArgs } = extraProps || {};
    const valueFormatter = useCallback((value: string | number | undefined) => {
      if (!value) {
        return '';
      }
      if (typeof value === 'string') {
        return value as string;
      }
      const hasDecimal = value - Math.floor(value) > 0;
      if (hasDecimal) {
        return formatPrecision(value, precision);
      }
      return String(value);
    }, []);
    const handleChange = useCallback(
      (value) => {
        onChange && onChange(value ? value : null);
      },
      [onChange],
    );

    return (
      <AntInputNumber
        ref={inputNumberRef}
        {...inputArgs}
        formatter={valueFormatter}
        controls={false}
        className="number-editor"
        onMouseDown={(e) => e.stopPropagation()}
        value={value as number}
        onChange={handleChange}
      />
    );
  };
  NumberEditor.formatter = (value: unknown) => {
    if (isNil(value) || isNaN(value as number)) {
      return null;
    }

    const result = parseFloat(String(value)?.replace(/,/g, ''));
    return result;
  };
  NumberEditor.parser = (value: unknown) => {
    if (isNil(value) || isNaN(value as number)) {
      return null;
    }
    return Number(formatPrecision(value as number, extraProps?.precision ?? 0));
  };

  NumberEditor.checker = (value: unknown) => {
    // parse number with thousands separator
    const result = parseFloat(String(value as string)?.replace(/,/g, ''));

    if (isNaN(result) || isNaN(value as number)) {
      return false;
    }
    return true;
  };

  return NumberEditor;
};
