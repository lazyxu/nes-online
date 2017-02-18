var initialState = new Object;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'nesSet':
      return action.nes;
    default:
      return state;
  }
}