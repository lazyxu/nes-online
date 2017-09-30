import util from './util.js'
import constant from "../constant.js"

export default function reducer(state = constant.INIT_USER_STATE, action) {
  switch (action.type) {
    case 'userSet':
      return action.user;
    case 'userUpdate':
      var newState = util.copyState(state);
      newState[action.key] = action.value;
      return newState;
    default:
      return state;
  }
}