import store from '../store.js'
import actions from '../actions/index.js'
import constant from '../constant.js'

var ws = null
var wsHandler = {}
exports.create = () => {
  if (!window["WebSocket"]) {
    alert('该浏览器不支持websocket，建议使用最新版chrome')
    return
  }

  ws = new WebSocket(constant.wsServer)

  ws.onopen = () => {
    console.log("WebSocket已经打开...")
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
    store.dispatch(actions.userSet(constant.INIT_USER_STATE))
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
  if (ws != null) {
    ws.send(JSON.stringify(data))
  } else {
    setTimeout(function () {
      if (ws != null) {
        ws.send(JSON.stringify(data))
      }
    }, 2000);
  }
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