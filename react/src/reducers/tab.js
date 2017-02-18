var initialState = 'GameList'
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'tabSet':
      return action.tab;
    default:
      return state;
  }
}