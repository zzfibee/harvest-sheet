import { createContext, useContext } from 'react';
import { WidthConfig } from '../type/sheet';

export const WidthContext = createContext<WidthConfig>({});

export function useWidth() {
  return useContext(WidthContext)!;
}
