var initialState = ''
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'gameTabSet':
      return action.gameTab;
    default:
      return state;
  }
}