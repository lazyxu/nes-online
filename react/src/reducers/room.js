var initialState = null
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'roomSet':
      return action.room;
    default:
      return state;
  }
}