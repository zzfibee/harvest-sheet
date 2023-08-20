import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef } from 'react';

const DataEditor = ({
  value,
  onKeyDown,
  onChange,
}: {
  value: string;
  onKeyDown: (e: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => void;
  onChange: (value: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return <input ref={inputRef} className="data-editor" value={value} onChange={handleChange} onKeyDown={onKeyDown} />;
};

export default DataEditor;
