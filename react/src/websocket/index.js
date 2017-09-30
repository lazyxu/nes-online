import user from './onmessage/user.js'
import room from './onmessage/room.js'

var ws = null
var wsHandler = {}
exports.create = () => {
  if (!window["WebSocket"]) {
    alert('该浏览器不支持websocket，建议使用最新版chrome')
    return
  }

  ws = new WebSocket('ws://' + document.location.hostname + ':' + document.location.port + '/ws')

  ws.onopen = () => {
    console.log("WebSocket已经打开...")
    user.handler(wsHandler)
    room.handler(wsHandler)
  }

  ws.onmessage = (e) => {
    var json = JSON.parse(e.data)
    for (var type in wsHandler) {
      if (json.type == type)
        wsHandler[type](json)
    }
  }

  ws.onerror = (e) => {
    console.error(e.message)
  }

  ws.onclose = (e) => {
    console.log(e.code, e.reason)
    alert("WebSocket已经断开")
  }
}

exports.addOnmessage = (type, callback) => {
  console.log('on ' + type)
  wsHandler[type] = callback
}

exports.removeOnmessage = (type) => {
  console.log('delete ' + type)
  delete wsHandler[type]
}

exports.close = () => {
  ws.close()
}

var send = data => {
  ws.send(JSON.stringify(data))
}
exports.send = data => {
  ws.send(JSON.stringify(data))
}
exports.createRoom = gameName => {
  send({
    type: "createRoom",
    game: gameName
  })
}
exports.getRoom = roomID => {
  send({
    type: "getRoom",
    roomID: roomID
  })
}
exports.leaveRoom = () => {
  send({
    "type": "leaveRoom",
  })
}
exports.ready = () => {
  send({
    "type": "ready",
  })
}
exports.unready = () => {
  send({
    "type": "unready",
  })
}
exports.start = () => {
  send({
    "type": "start",
  })
}