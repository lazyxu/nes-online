import util from './util.js'
var initialState = new Object();
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'roomlistUpdate':
      var newState = util.copyState(state);
      newState[action.room.id] = action.room;
      return newState;
    case 'roomlistRemove':
      var newState = util.copyState(state);
      delete newState[action.roomID];
      return newState;
    case 'roomlistSet':
      return action.roomlist;
    default:
      return state;
  }
}