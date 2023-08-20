import { ChangeEvent, useEffect, useRef } from 'react';

const DataEditor: Sheet.CellEditor = ({ value, cell, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      className="data-editor"
      value={value as string}
      onChange={handleChange}
    />
  );
};

export default DataEditor;
