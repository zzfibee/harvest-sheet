import type { SheetType } from '@zhenliang/sheet/type';
import { Cascader } from 'antd';
import 'antd/es/cascader/style/index.css';
import { useMemo } from 'react';
import { optionsTransferToValue, valuesTransferToLabel } from '../../util';
import './index.less';

const getCascaderEditor = (options: SheetType.OptionsType[]) => {
  const CascaderEditor: SheetType.CellEditor = (props) => {
    const { value, onConfirm } = props;

    const val = useMemo(
      () => optionsTransferToValue(options, value as string),
      [value, options],
    );

    const handleChange = (opt: any) => {
      onConfirm(
        opt ? valuesTransferToLabel(options, opt[opt.length - 1]) : null,
      );
    };

    return (
      <Cascader
        autoFocus
        open
        className={'cascader-editor'}
        onMouseDown={(event: any) => {
          event.stopPropagation();
        }}
        value={val}
        // allowClear={false}
        displayRender={(label) => label[label.length - 1]}
        onChange={handleChange}
        // onBlur={handleBlur}
        // onKeyDown={handleKeyDown}
        options={options}
      />
    );
  };

  CascaderEditor.checker = (value) => {
    const res = optionsTransferToValue(options, value as string);
    return res && res.length > 0;
  };
  return CascaderEditor;
};
export default getCascaderEditor;
