import constant from '../constant.js'
var initialState = {
  room: null,
  roomTab: constant.ROOM_STATE_NORMAL,
}
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'roomSet':
      return action.room;
    case 'roomTabSet':
      return action.roomTab;
    default:
      return state;
  }
}