import { reducerAction } from '.';

export const stateReducer: Record<string, reducerAction> = {
  change(state, payload) {
    const { key, value } = payload as { key: string; value: string };
    return { ...state, [key]: value };
  },
  changes(state, payload) {
    return { ...state, ...(payload as Partial<Sheet.UpdateStateType>) };
  },
  rowMove(state, payload) {
    const maxRow = (state.data?.length || 0) - 1;
    const newRow = (state.end?.row || 0) + (payload as number);
    if (newRow < 0 || newRow > maxRow) return state;
    return {
      ...state,
      end: {
        col: state.end?.col as number,
        row: newRow,
      },
    };
  },
  colMove(state, payload) {
    const maxCol = (state.data?.[0]?.length || 0) - 1;
    const newCol = (state.end?.col || 0) + (payload as number);
    if (newCol < 0 || newCol > maxCol || state.data?.[0][newCol].fixed)
      return state;
    return {
      ...state,
      end: {
        row: state.end?.row as number,
        col: newCol,
      },
    };
  },
  editFinish(state, payload) {
    const { data } = state;
    const {
      cell: { row, col, confirm },
    } = payload as {
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
  },
  pushHistory(state, payload) {
    return {
      ...state,
      history: [...(state.history || []), payload as Sheet.OperateHistory],
    };
  },
  selectRow(state, payload) {
    const startCol = state.data?.[0]?.findIndex((item) => !item.fixed) || 0;
    const endCol = (state.data?.[0].length || 0) - 1;
    if (startCol >= 0 && endCol >= 0) {
      return {
        ...state,
        start: {
          row: payload as number,
          col: startCol,
        },
        end: {
          row: payload as number,
          col: endCol,
        },
        lastSelected: {
          start: state.start,
          end: state.end,
        },
      };
    }
    return {};
  },
  clearSelect(state) {
    const { start, end } = state;
    return {
      ...state,
      start: undefined,
      end: undefined,
      lastSelected: {
        start,
        end,
      },
    };
  },
  clearSelectIfNotSingleRow(state) {
    const { start, end } = state;
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
  },
  clearEdit(state) {
    const { editing } = state;
    return {
      ...state,
      editing: undefined,
      lastEditing: editing,
    };
  },
};
