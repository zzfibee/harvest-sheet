import { Sheet } from '@harvest/sheet';
import React, { useState } from 'react';

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
  [
    { readOnly: true, value: 5 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
  [
    { readOnly: true, value: 6 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
  [
    { readOnly: true, value: 7 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
  [
    { readOnly: true, value: 8 },
    { value: 2 },
    { value: 4 },
    { value: 4 },
    { value: 4 },
  ],
];

const BasicSheet: React.FC = () => {
  const [state, setState] = useState(grid);

  const valueRenderer = (cell: { value: string }) => cell.value;
  const onCellsChanged = (changes: any) => {
    const newGrid = [...grid];
    changes.forEach(({ cell, row, col, value }: any) => {
      newGrid[row][col] = { ...grid[row][col], value };
    });
    setState(newGrid);
  };

  return (
    <Sheet
      data={state as any}
      // valueRenderer={valueRenderer}
      onCellsChanged={onCellsChanged}
    />
  );
};

export default BasicSheet;
