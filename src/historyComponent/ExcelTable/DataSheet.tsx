import { eq } from 'lodash';
import { memo } from 'react';

import ReactDataSheet from '../Datasheet';

const DataSheet = (props: Partial<DataSheetType.SheetProps>) => {
  const {
    data,
    sheetRenderer,
    freePaste,
    rowRenderer,
    onCellsChanged,
    onContextMenu,
    handleBack,
    rowClassName,
  } = props;
  return (
    <ReactDataSheet
      data={data as any}
      freePaste={freePaste}
      sheetRenderer={sheetRenderer}
      rowRenderer={rowRenderer as any}
      onCellsChanged={onCellsChanged as any}
      onContextMenu={onContextMenu as any}
      handleBack={handleBack}
      rowClassName={rowClassName}
    />
  );
};

export default memo(DataSheet, (prev, next) => {
  const { data: dataN, sheetRenderer: sheetRendererN } = next;
  const { data, sheetRenderer } = prev;
  return sheetRenderer === sheetRendererN && eq(data, dataN);
});
