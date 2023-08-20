import React, { useState } from 'react';
import Datasheet from '../../core/sheet';

const grid = [
  [
    { readOnly: true, value: '' },
    { value: 'A', readOnly: true },
    { value: 'B', readOnly: true },
    { value: 'C', readOnly: true },
    { value: 'D', readOnly: true },
  ],
  [
    { readOnly: true, value: 1 },
    { value: 1 },
    { value: 3 },
    { value: 3 },
    { value: 3 },
  ],
  [
    { readOnly: true, value: 2 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
  [
    { readOnly: true, value: 3 },
    { value: 1 },
    { value: 3 },
    { value: 3 },
    { value: 3 },
  ],
  [
    { readOnly: true, value: 4 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
];

const BasicSheet: React.FC = () => {
  const [state, setState] = useState(grid);

  const onCellsChanged = (changes: Sheet.CellData[]) => {
    const newGrid = [...grid];
    changes.forEach(({ cell, row, col, value }: any) => {
      newGrid[row][col] = { ...grid[row][col], value };
    });
    setState(newGrid);
  };

  return <Datasheet data={state as any} onCellsChanged={onCellsChanged} />;
};

export default BasicSheet;
