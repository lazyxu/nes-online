var initialState = []
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'msgSet':
      return action.msg;
    case 'msgAdd':
      var newState = state.concat();
      newState.push(action.msg);
      return newState;
    default:
      return state;
  }
}