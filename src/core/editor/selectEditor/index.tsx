import { Select } from 'antd';
import 'antd/es/select/style/index.css';
import './index.less';

export const GetSelectEditor = (options: any): Sheet.CellEditor => {
  const SelectEditor: Sheet.CellEditor = (props) => {
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

    return (
      <Select
        autoFocus
        className="select-editor"
        defaultOpen
        allowClear
        open
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        options={options}
        popupClassName={'excelTablePopupClassName'}
      />
    );
  };

  SelectEditor.checker = (value) => {
    return (
      options.some((item: any) => item.value === value) ||
      options.some((item: any) => item.label === value)
    );
  };

  return SelectEditor;
};

export default GetSelectEditor;
