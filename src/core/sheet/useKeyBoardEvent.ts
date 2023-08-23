import { useKeyBoard } from '@zhenliang/sheet/hooks';
import { Dispatch } from '@zhenliang/sheet/hooks/useMiddlewareReducer';
import type { SheetType } from '@zhenliang/sheet/type';
import { sideEffectReducer } from '../reducers/sideEffectReducer';

export const useKeyBoardEvent = (
  dispatch: Dispatch,
  elementRef: React.RefObject<SheetType.refAssertion>,
) => {
  useKeyBoard(
    {
      move: (e, value: any) => {
        dispatch({ type: 'move', payload: value });
      },
      escape: () => {
        dispatch({ type: 'escape' });
      },
      reverse: () => {
        dispatch(sideEffectReducer.reverse);
      },
      delete: () => {
        dispatch(sideEffectReducer.delete);
      },
      enter: () => {
        dispatch({ type: 'enter' });
      },
      otherInput: (e, value: string) => {
        dispatch({ type: 'otherInput', payload: value });
      },
      copy: () => {
        dispatch(sideEffectReducer.copy);
      },
      paste: () => {
        dispatch(sideEffectReducer.paste);
      },
      cut: () => {
        dispatch(sideEffectReducer.copy);
        dispatch(sideEffectReducer.delete);
      },
    },
    elementRef.current,
  );
};
