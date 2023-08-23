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
  | 'selectRow'
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
  type: Partial<Sheet.UpdateStateType>,
  payload?: unknown,
) => Partial<Sheet.UpdateStateType>;

const sheetReducer = (
  state: Partial<Sheet.UpdateStateType>,
  action: { type: SheetAction; payload?: unknown },
) => {
  switch (action.type) {
    case 'change':
    case 'changes':
    case 'rowMove':
    case 'colMove':
    case 'editFinish':
    case 'pushHistory':
    case 'selectRow':
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
