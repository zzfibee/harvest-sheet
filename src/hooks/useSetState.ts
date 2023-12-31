import { useCallback, useState } from 'react';

const useSetState = <T extends object>(
  initialState: T = {} as T,
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
  const [state, setState] = useState<T>(initialState);

  const setMergeState = useCallback(
    (patch: Partial<T> | ((arg0: T) => Partial<T>)) => {
      setState((prevState) => ({
        ...prevState,
        ...(typeof patch === 'function' ? patch(prevState) : patch),
      }));
    },
    [],
  );

  return [state, setMergeState];
};

export { useSetState };
