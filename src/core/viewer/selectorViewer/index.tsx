/* eslint-disable eqeqeq */
// == string 和 number 类型忽略
import { SheetType } from '@zhenliang/sheet/type';

export const GetSelectorViewer = (options: SheetType.Options[]) => {
  const TypeViewer: SheetType.CellViewer = (props) => {
    return options.find(
      (item) => item.label === props.value || item.value == props.value,
    ).label;
  };
  return TypeViewer;
};
