import type { SheetType } from '@zhenliang/sheet/type';
import { Cascader } from 'antd';
import 'antd/es/cascader/style/index.css';
import { useMemo } from 'react';
import {
  optionsToValuesFromLabelOrValue,
  valuesTransferToLabel,
} from '../../util';
import './index.less';

const getCascaderEditor = (options: SheetType.OptionsType[]) => {
  const CascaderEditor: SheetType.CellEditor = (props) => {
    const { value, onConfirm } = props;

    const val = useMemo(() => {
      const res = optionsToValuesFromLabelOrValue(options, value as string);
      return res;
    }, [value, options]);
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
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return !res?.length
      ? ''
      : valuesTransferToLabel(options, res[res.length - 1]);
  };

  CascaderEditor.parser = (value) => {
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return res.length ? res[res.length - 1] : null;
  };
  CascaderEditor.checker = (value) => {
    const res = optionsToValuesFromLabelOrValue(options, value as string);
    return !!res.length;
  };
  return CascaderEditor;
};
export default getCascaderEditor;
