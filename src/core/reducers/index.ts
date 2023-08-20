import { keyboardReducer } from './keyboardReducer';
import { mouseReducer } from './mouseReducer';

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
  const { start, end } = state;
  switch (action.type) {
    case 'change':
      const { key, value } = action.payload as { key: string; value: string };
      return { ...state, [key]: value };
    case 'changes':
      const { payload } = action as {
        payload: Partial<Sheet.UpdateStateType>;
      };
      return { ...state, ...payload };
    case 'rowMove':
      const maxRow = (state.data?.length || 0) - 1;
      const newRow = (state.end?.row || 0) + (action.payload as number);
      if (newRow < 0 || newRow > maxRow) return state;
      return {
        ...state,
        end: {
          col: state.end?.col as number,
          row: newRow,
        },
      };
    case 'colMove':
      const maxCol = (state.data?.[0]?.length || 0) - 1;
      const newCol = (state.end?.col || 0) + (action.payload as number);
      if (newCol < 0 || newCol > maxCol || state.data?.[0][newCol].fixed)
        return state;
      return {
        ...state,
        end: {
          row: state.end?.row as number,
          col: newCol,
        },
      };
    case 'editFinish':
      const { data } = state;
      const {
        cell: { row, col, confirm },
      } = action.payload as {
        cell: Sheet.CellData & { confirm: boolean };
      };
      let history = [...(state.history || [])];
      const current = data?.[row]?.[col].value;
      console.log(history.length, current);
      history.push({
        changes: [{ row, col, value: current as string }],
        type: 'Edit' as Sheet.OperateType,
      });
      if (confirm) {
        return {
          ...state,
          editing: undefined,
          lastEditing: state.editing,
          history,
        };
      }
      return {
        ...state,
        history,
      };
    case 'pushHistory':
      return {
        ...state,
        history: [
          ...(state.history || []),
          action.payload as Sheet.OperateHistory,
        ],
      };
    case 'selectRow':
      const startCol = state.data?.[0]?.findIndex((item) => !item.fixed) || 0;
      const endCol = (state.data?.[0].length || 0) - 1;
      if (startCol >= 0 && endCol >= 0) {
        return {
          ...state,
          start: {
            row: action.payload as number,
            col: startCol,
          },
          end: {
            row: action.payload as number,
            col: endCol,
          },
          lastSelected: {
            start: state.start,
            end: state.end,
          },
        };
      }
      return {};

    case 'clearSelect':
      return {
        ...state,
        start: undefined,
        end: undefined,
        lastSelected: {
          start,
          end,
        },
      };
    case 'clearSelectIfNotSingleRow':
      if (start?.row === end?.row) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        start: undefined,
        end: undefined,
        lastSelected: {
          start,
          end,
        },
      };
    case 'clearEdit':
      const { editing } = state;
      return {
        ...state,
        editing: undefined,
        lastEditing: editing,
      };
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
