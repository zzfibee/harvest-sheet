import { reducerAction } from '.';

export const keyboardReducer: Record<string, reducerAction> = {
  move(state, payload) {
    const { row, col } = payload as Sheet.CellPosition;
    const currentPos = {
      row: (state.start?.row || 0) + row,
      col: (state.start?.col || 0) + col,
    };
    let lastEditing = state.lastEditing;
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }

    return {
      ...state,
      start: currentPos,
      end: currentPos,
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      editing: undefined,
      lastEditing,
    };
  },
  escape(state, payload) {
    return {
      ...state,
      editing: undefined,
      lastEditing: state.editing,
    };
  },
  reverse(state, payload) {
    return state;
  },
  delete(state, payload) {
    return state;
  },
  enter(state, payload) {
    const { start, end, editing } = state;
    if (!start || !end) {
      return state;
    }

    if (!editing) {
      return {
        ...state,
        end: start,
        editing: { ...start, value: payload as string },
      };
    }
    return keyboardReducer.move(state, { row: 1, col: 0 });
  },
  otherInput(state, payload) {
    if (state.editing) return state;
    return keyboardReducer.enter(state, payload);
  },
};
