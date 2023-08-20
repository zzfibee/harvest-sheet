import { Cascader } from 'antd';
import { useState } from 'react';

import { optionsTransferToValue } from './helper';

import './index.less';

const cascaderEditor =
  (options: ExcelTableType.OptionsType[]) => (props: any) => {
    const { onCommit, onRevert, value, cell } = props;
    // eslint-disable-next-line
    const [val, setVal] = useState<any>(() =>
      optionsTransferToValue(options, value || cell.value),
    );

    const handleChange = (opt: any) => {
      onCommit(opt ? opt[opt.length - 1] : null);
      setVal(opt);
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

    return (
      <Cascader
        autoFocus
        className={'select'}
        defaultOpen
        onMouseDown={(event: any) => {
          event.stopPropagation();
        }}
        value={val}
        // allowClear={false}
        displayRender={(label) => label[label.length - 1]}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        options={options}
        popupClassName={'excelTablePopupClassName'}
      />
    );
  };

export default cascaderEditor;
