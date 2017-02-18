var initialState = {
  name: '未登录',
  avatar: '/img/avatar/questionMark.jpg'
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'userSet':
      return action.user;
    default:
      return state;
  }
}