import store from '../store.js'

exports.gameSet = game => {
  return {
    type: "gameSet",
    game: game
  }
}
exports.keyboardSet = keyboard => {
  return {
    type: "keyboardSet",
    keyboard: keyboard
  }
}
exports.gamelistSet = gamelist => {
  return {
    type: "gamelistSet",
    gamelist: gamelist
  }
}
exports.roomSet = room => {
  return {
    type: "roomSet",
    room: room
  }
}
exports.nesSet = nes => {
  return {
    type: "nesSet",
    nes: nes
  }
}
exports.userUpdate = (key, value) => {
  return {
    type: "userUpdate",
    key: key,
    value: value
  }
}
exports.msgSet = msg => {
  return {
    type: "msgSet",
    msg: msg
  }
}
exports.msgAdd = msg => {
  return {
    type: "msgAdd",
    msg: msg
  }
}
exports.roomlistSet = roomlist => {
  return {
    type: "roomlistSet",
    roomlist: roomlist
  }
}
exports.roomlistUpdate = room => {
  return {
    type: "roomlistUpdate",
    room: room
  }
}
exports.roomlistRemove = roomID => {
  return {
    type: "roomlistRemove",
    roomID: roomID
  }
}

exports.userSet = user => {
  return {
    type: "userSet",
    user: user
  }
}

exports.gameTabSet = gameTab => {
  return {
    type: "gameTabSet",
    gameTab: gameTab
  }
}

exports.roomTabSet = roomTab => {
  return {
    type: "roomTabSet",
    roomTab: roomTab
  }
}

exports.tabSet = (tab, force = false) => {
  if (!force && store.getState().tab=="Room") {
    alert("你在房间中，请退出房间后再进行操作！");
    return {
      type: "inRoom",
    }
  }
  if (!force && store.getState().tab=="Game") {
    return {
      type: "inGame",
    }
  }
  return {
    type: "tabSet",
    tab: tab
  }
}