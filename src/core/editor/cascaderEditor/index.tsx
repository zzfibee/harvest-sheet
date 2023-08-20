import { Cascader } from 'antd';
import 'antd/es/cascader/style/index.css';
import { useMemo } from 'react';
import { optionsTransferToValue } from '../../util';
import './index.less';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'West Lake',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'Zhong Hua Men',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

export const CascaderEditor: Sheet.CellEditor = (props) => {
  const { value, onChange, onConfirm } = props;

  const val = useMemo(
    () => optionsTransferToValue(options, value as string),
    [value, options],
  );

  const handleChange = (opt: any) => {
    console.log(opt);
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

CascaderEditor.checker = (value) => {
  const res = optionsTransferToValue(options, value as string);
  return res && res.length > 0;
};
