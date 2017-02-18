import util from './util.js'
var initialState = {}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'keyboardSet':
      return action.keyboard;
    case 'keyboardSetOne':
      var newState = util.copyState(state);
      newState[action.key] = action.value;
      return newState;
    default:
      return state;
  }
}