import { Map } from 'immutable';
import { OrderedMap } from 'immutable/dist/immutable';

const initialState = Map({
  endIndex: 0,
  capacity: 100,
  items: []
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'LOAD_ACTIVITY':
      const endIndex = action.payload.endIndex;
      state = state.set("endIndex", endIndex);
      state = state.set("capacity", action.payload.capacity);
      state = state.set('items', OrderedMap());
      const capacity = action.payload.capacity;
      let start = 0;
      if (endIndex >= capacity) {
        start = endIndex - capacity;
      }
      action.payload.items.forEach((v, i) => {
        const num = start + i;
        state = state.setIn(['items', "act-" + num], v);
      });
      return state;
    case 'ADD_ACTIVITY':
      state = state.set("endIndex", action.payload.endIndex);
      state = state.setIn(['items', "act-" + action.payload.endIndex], action.payload.item);
      return state;
    default:
      return state;
  }
};
