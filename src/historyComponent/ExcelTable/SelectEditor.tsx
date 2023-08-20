import { Select } from 'antd';
import React, { CSSProperties, ReactNode, useCallback, useState } from 'react';

import './index.less';

const SelectEditor =
  (
    options: { label: string; value: string | number; disabled?: boolean }[],
    extra?: ReactNode,
    optionsLabelAlign?: 'left' | 'right',
  ) =>
  (props: any) => {
    const { onCommit, onRevert, value, cell } = props;
    // eslint-disable-next-line
    const [val, setVal] = useState<any>(() =>
      options.find((item) => item.value == value || item.value == cell.value),
    );

    const handleChange = (opt: any) => {
      const updateValue = opt === undefined ? null : opt;
      onCommit(updateValue);
      setVal(updateValue);
    };

    const handleBlur = () => {
      onRevert();
    };

    const handleKeyDown = (ev: any) => {
      // record last key pressed so we can handle enter
      if (ev.which === 13 || ev.which === 9) {
        ev.persist();
      }
    };

    const dropdown = useCallback(
      (menu: any) => (
        <>
          {menu}
          {extra}
        </>
      ),
      [],
    );
    const optionsStyle: CSSProperties =
      optionsLabelAlign === 'right' ? { textAlign: 'right' } : {};
    return (
      <Select
        autoFocus
        className={'select'}
        defaultOpen
        allowClear
        open
        style={optionsStyle}
        dropdownStyle={optionsStyle}
        onMouseDown={(event: any) => {
          event.stopPropagation();
        }}
        value={val}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        options={options}
        popupClassName={'excelTablePopupClassName'}
        dropdownRender={dropdown}
      />
    );
  };

export default SelectEditor;
