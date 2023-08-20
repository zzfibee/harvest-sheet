import { Dispatch } from '@zsheet/zsheet/hooks/useMiddlewareReducer';
import { useEffect } from 'react';
import { sideEffectReducer } from '../reducers';

export const useCellEvent = (
  dispatch: Dispatch,
  listenerVar?: Partial<Sheet.UpdateStateType>,
) => {
  const { start, end, lastSelected, editing, lastEditing } = listenerVar || {};

  useEffect(() => {
    dispatch(sideEffectReducer.init);
    return () => {
      dispatch(sideEffectReducer.destroy);
    };
  }, []);
  useEffect(() => {
    dispatch(sideEffectReducer.emitSelectChange);
  }, [start, end, lastSelected]);

  useEffect(() => {
    dispatch(sideEffectReducer.emitEditChange);
  }, [editing, lastEditing]);
};
