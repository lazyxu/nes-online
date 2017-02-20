import util from './util.js'
var initialState = {
  name: '未登录',
  avatar: '/img/avatar/questionMark.jpg'
}
export default function reducer(state = initialState, action) {
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