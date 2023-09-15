/* eslint-disable eqeqeq */
import type { SheetType } from '@zhenliang/sheet/type';
import { Select, SelectProps } from 'antd';

import 'antd/es/select/style/index.css';
import { useState } from 'react';
import { isNil } from 'lodash';
import './index.less';

export const getSelectEditor = (
  options: SheetType.Options[],
  valueKey: string = 'value',
  extra: React.ReactNode = <></>,
  selectProps: Partial<SelectProps> = {},
): SheetType.CellEditor => {
  const SelectEditor: SheetType.CellEditor = (props) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const { value, onConfirm } = props;

    const handleChange = (opt: any) => {
      const updateValue = opt === undefined ? null : opt;
      onConfirm(updateValue);
    };

    const handleKeyDown = (ev: any) => {
      // record last key pressed so we can handle enter
      if (ev.which === 13 || ev.which === 9) {
        ev.persist();
      }
    };

    const dropdown = (menu: React.ReactNode) => (
      <div onClick={()=>{setIsOpen(false)}}>
        {menu}
        {extra}
      </div>
    );

    return (
      <Select
        {...selectProps}
        autoFocus
        className="select-editor"
        allowClear
        open={isOpen}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        value={SelectEditor.formatter ? SelectEditor.formatter(value) : value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        options={options}
        popupClassName={'excelTablePopupClassName'}
        dropdownRender={dropdown}
      />
    );
  };

  SelectEditor.checker = (value) => {
    if (isNil(value)) return true;
    return (
      options.some((item: any) => item.value == value) ||
      options.some((item: any) => item.label === value)
    );
  };
  SelectEditor.parser = (value) => {
    return (
      options.find((item: any) => item.value == value)?.[valueKey] ||
      options.find((item: any) => item.label === value)?.[valueKey]
    );
  };
  SelectEditor.formatter = (value) => {
    return (
      options.find((item: any) => item.value == value)?.label ||
      options.find((item: any) => item.label === value)?.label
    );
  };

  return SelectEditor;
};

export default getSelectEditor;
