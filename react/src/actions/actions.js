//定义一个change方法，将来把它绑定到props上
exports.setGame = (game) => {
  return {
    type: "setGame",
    game: game
  }
}
exports.setRoom = (room) => {
  return {
    type: "setRoom",
    room: room
  }
}
exports.setUser = (user) => {
  return {
    type: "setUser",
    user: user
  }
}
exports.setGameTab = (gameTab) => {
  return {
    type: "setGameTab",
    gameTab: gameTab
  }
}
exports.setNES = (nes) => {
  return {
    type: "setNES",
    nes: nes
  }
}