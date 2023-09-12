import type { SheetType } from '@zhenliang/sheet/type';
import { keyboardReducer } from './keyboardReducer';
import { mouseReducer } from './mouseReducer';
import { stateReducer } from './stateReducer';

export type SheetAction =
  | 'change'
  | 'changes'
  | 'rowMove'
  | 'colMove'
  | 'editFinish'
  | 'pushHistory'
  | 'popHistory'
  | 'selectRow'
  | 'select'
  | 'clearSelect'
  | 'clearSelectIfNotSingleRow'
  | 'clearEdit'
  | 'mouseDown'
  | 'mouseOver'
  | 'mouseUp'
  | 'loseFocus'
  | 'doubleClick'
  | 'mouseLeaveInterval'
  | 'move'
  | 'escape'
  | 'reverse'
  | 'delete'
  | 'enter'
  | 'otherInput'
  | 'none';

export type reducerAction = (
  type: Partial<SheetType.UpdateStateType>,
  payload?: unknown,
) => Partial<SheetType.UpdateStateType>;

const sheetReducer = (
  state: Partial<SheetType.UpdateStateType>,
  action: { type: SheetAction; payload?: unknown },
) => {
  switch (action.type) {
    case 'change':
    case 'changes':
    case 'rowMove':
    case 'colMove':
    case 'editFinish':
    case 'pushHistory':
    case 'popHistory':
    case 'selectRow':
    case 'select':
    case 'clearSelect':
    case 'clearSelectIfNotSingleRow':
    case 'clearEdit':
      return stateReducer[action.type](state, action.payload);
    case 'mouseDown':
    case 'mouseOver':
    case 'mouseUp':
    case 'loseFocus':
    case 'doubleClick':
    case 'mouseLeaveInterval':
      return mouseReducer[action.type](state, action.payload);
    case 'move':
    case 'escape':
    case 'reverse':
    case 'delete':
    case 'enter':
    case 'otherInput':
      return keyboardReducer[action.type](state, action.payload);
    default:
      throw new Error('Unexpected action');
  }
};

export default sheetReducer;

export { sideEffectReducer } from './sideEffectReducer';
