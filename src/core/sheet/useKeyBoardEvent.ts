import { useKeyBoard } from '@zsheet/zsheet/hooks';
import { Dispatch } from '@zsheet/zsheet/hooks/useMiddlewareReducer';
import { sideEffectReducer } from '../reducers/sideEffectReducer';

export const useKeyBoardEvent = (
  dispatch: Dispatch,
  elementRef: React.RefObject<Sheet.refAssertion>,
) => {
  useKeyBoard(
    {
      move: (e, value: any) => {
        dispatch({ type: 'move', payload: value });
      },
      escape: (e) => {
        dispatch({ type: 'escape' });
      },
      reverse: (e, value: any) => {
        dispatch(sideEffectReducer.reverse);
      },
      delete: (e, value: any) => {
        dispatch(sideEffectReducer.delete);
      },
      enter: (e, value: any) => {
        dispatch({ type: 'enter' });
      },
      otherInput: (e, value: string) => {
        dispatch({ type: 'otherInput', payload: value });
      },
      copy: (e, value: any) => {
        dispatch(sideEffectReducer.copy);
      },
      paste: (e, value: any) => {
        dispatch(sideEffectReducer.paste);
      },
      cut: (e, value: any) => {
        dispatch(sideEffectReducer.copy);
        dispatch(sideEffectReducer.delete);
      },
    },
    elementRef.current,
  );
};
