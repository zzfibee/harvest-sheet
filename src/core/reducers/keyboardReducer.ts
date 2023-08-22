import { isNil } from 'lodash';
import { reducerAction } from '.';
import { getNextVisibleRow, groupConfigToGroupMap } from '../util';

export const keyboardReducer: Record<string, reducerAction> = {
  move(state, payload) {
    const { row, col } = payload as Sheet.CellPosition;
    const { groupConfig, data = [] } = state;
    let newRow: number | null = (state.start?.row || 0) + row;
    if (groupConfig) {
      newRow = getNextVisibleRow(
        newRow,
        data.length,
        groupConfigToGroupMap(groupConfig),
      );
    }
    let currentPos = {
      row: newRow as number,
      col: (state.start?.col || 0) + col,
    };
    let lastEditing = state.lastEditing;
    if (state.editing) {
      lastEditing = { ...state.editing, confirm: true };
    }

    if (isNil(currentPos.row)) {
      return {
        ...state,
        start: undefined,
        end: undefined,
        lastSelected: {
          start: state.start,
          end: state.end,
        },
        editing: undefined,
        lastEditing,
      };
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
