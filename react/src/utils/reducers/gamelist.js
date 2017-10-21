import util from './util.js'
var initialState = new Array();
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'gamelistSet':
      return action.gamelist;
    default:
      return state;
  }
}