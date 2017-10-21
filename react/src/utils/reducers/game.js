var initialState = ''
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'gameSet':
      return action.game;
    default:
      return state;
  }
}