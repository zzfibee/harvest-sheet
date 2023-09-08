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
      () =>
        optionsTransferToValue(options, value as string) ||
        optionsTransferToValue(options, value as string, 'value'),
      [value, options],
    );

    const handleChange = (opt: any) => {
      onConfirm(opt ? opt[opt.length - 1] : null);
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

  CascaderEditor.formatter = (value) => {
    const labelRes = optionsTransferToValue(options, value as string);
    const valueRes = optionsTransferToValue(options, value as string, 'value');
    const res = labelRes?.length ? labelRes : valueRes;
    if (!res?.length) {
      return '';
    }

    const label = valuesTransferToLabel(options, res[res.length - 1]);

    return label;
  };

  CascaderEditor.checker = (value) => {
    const labelRes = optionsTransferToValue(options, value as string);
    const valueRes = optionsTransferToValue(options, value as string, 'value');

    return !!labelRes?.length || !!valueRes?.length;
  };
  return CascaderEditor;
};
export default getCascaderEditor;
