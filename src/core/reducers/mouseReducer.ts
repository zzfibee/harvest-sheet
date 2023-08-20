import { reducerAction } from '.';

export const mouseReducer: Record<string, reducerAction> = {
  mouseDown(state, payload) {
    const {
      pos: { row, col },
      shiftKey,
    } = payload as {
      pos: { row: number; col: number };
      shiftKey: boolean;
    };
    const { data } = state;
    if (data?.[row][col].readonly) {
      return {
        ...state,
      };
    }

    if (shiftKey) {
      return {
        ...state,
        mouseDown: true,
        editing: undefined,
        lastEditing: state.editing,
        start: state.start ? state.start : { row, col },
        end: { row, col },
        lastSelected: {
          start: state.start,
          end: state.end,
        },
      };
    }
    return {
      ...state,
      mouseDown: true,
      editing: undefined,
      lastEditing: state.editing,
      start: { row, col },
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  mouseOver(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };

    const { data } = state;

    if (state.mouseDown === false || data?.[row][col].readonly) return state;
    return {
      ...state,
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  mouseUp(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };

    const { data } = state;
    if (state.mouseDown === false || data?.[row][col].readonly) return state;
    return {
      ...state,
      mouseDown: false,
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  loseFocus(state) {
    let lastEditing = state.lastEditing;
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }
    return {
      ...state,
      start: undefined,
      end: undefined,
      editing: undefined,
      lastEditing,
      lastSelected: {
        start: state.start,
        end: state.end,
      },
    };
  },
  doubleClick(state, payload) {
    const { row, col } = payload as {
      row: number;
      col: number;
    };
    const { data } = state;
    if (data?.[row][col]?.readonly) {
      return state;
    }
    return {
      ...state,
      mouseDown: false,
      editing: { row, col },
      start: { row, col },
      end: { row, col },
      lastSelected: {
        start: state.start,
        end: state.end,
      },
      lastEditing: state.editing,
    };
  },
  mouseLeaveInterval(state, payload) {
    const { end } = payload as { end: Sheet.CellPosition };
    const { data } = state;
    // fixed 列不选中
    if (data?.[0]?.[end.col]?.fixed) {
      return state;
    }

    return {
      ...state,
      end,
    };
  },
};
