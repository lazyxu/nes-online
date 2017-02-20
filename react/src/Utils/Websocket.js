import config from './config'
import store from '../store.js'
import actions from '../actions/actions.js'

window.ws = null;
var wsHandler={};

wsHandler['roomlist'] = data => {
  if (data.rooms == null) {
    store.dispatch(actions.roomlistSet(new Object()));
  } else {
    store.dispatch(actions.roomlistSet(data.rooms));
  }
}
wsHandler['createRoom'] = data => {
  store.dispatch(actions.roomlistUpdate(data.roomlist));
  if (data.from == store.getState().user.name) {
    store.dispatch(actions.roomSet(data.room));
    store.dispatch(actions.userUpdate("idInRoom", data.idInRoom));
    store.dispatch(actions.tabSet('Room'));
  }
}
wsHandler["leaveRoom"] = data => {
  if (data.roomlist == "empty") {
    store.dispatch(actions.roomlistRemove(data.roomID));
  } else {
    store.dispatch(actions.roomlistUpdate(data.roomlist));
  }
  if (data.from == store.getState().user.name) {
    store.dispatch(actions.tabSet('RoomList', true));
    store.dispatch(actions.roomSet(null));
  } else {
    if (data.room != null && store.getState().room != null && data.room.id == store.getState().room.id) {
      store.dispatch(actions.roomSet(data.room));
    }
  }
}
wsHandler['enterRoom'] = data => {
  store.dispatch(actions.roomlistUpdate(data.roomlist));
  if (store.getState().room==null) {
    if (data.from==store.getState().user.name) {
      store.dispatch(actions.roomSet(data.room));
      store.dispatch(actions.userUpdate("idInRoom", data.idInRoom));
      store.dispatch(actions.tabSet('Room'));
    }
  } else {
    if (data.room.id==store.getState().room.id) {
      store.dispatch(actions.roomSet(data.room));
    }
  }
}
wsHandler['updateRoom'] = data => {
  store.dispatch(actions.roomlistUpdate(data.roomlist));
  if (data.room != null && store.getState().room != null && data.room.id == store.getState().room.id) {
    store.dispatch(actions.roomSet(data.room));
  }
}
wsHandler["start"] = data => {
  if (data.room != null && store.getState().room != null && data.room.id == store.getState().room.id) {
    store.dispatch(actions.tabSet("Game", true));
    if (typeof data.keyboard[0]!=="undefined") {
      window.nes.keyboard.player[0] = data.keyboard[0];
    }
    if (typeof data.keyboard[1]!=="undefined") {
      window.nes.keyboard.player[1] = data.keyboard[1];
    }
  }
}
wsHandler["relogin"] = data => {
  alert("你的账号在异地登录，如果不是你本人操作，请及时修改密码");
  location.reload(true);
}
wsHandler["keyboard"]= data => {
  var len = 0;
  for (var i=0; i<data.keyboard.length; i++)
    len += data.keyboard[i].length;
  if (len!=0)
    console.log(window.nes.keyboardActionReceived[data.idInRoom]);
  window.nes.keyboardActionReceived[data.idInRoom] = data.keyboard;
  window.nes.keyboardActionReceivedFlag[data.idInRoom] = true;
}
exports.createWS = user => {
  if (window["WebSocket"]) {
    ws = new WebSocket(config.wsServer);

    ws.onopen = () => {
      console.log("WebSocket已经打开...");
      ws.send(JSON.stringify({
        "type": "in",
        "user": user
      }));
    };

    ws.onmessage = (e) => {
      var json=JSON.parse(e.data);
      if (json.type!="keyboard")
        console.log(json);
      for (var type in wsHandler) {
        if (json.type==type)
          wsHandler[type](json);
      }
    };

    ws.onerror = (e) => {
      console.log(e.message);
    };

    ws.onclose = (e) => {
      console.log(e.code, e.reason);
    };
  }
}

exports.on = (type, callback) => {
  console.log('on ' + type);
  wsHandler[type] = callback;
}

exports.send = content => {
  ws.send(JSON.stringify(content));
}

exports.sendRoomMsg = msg => {
  ws.send(JSON.stringify({
    "type": "roomMsg",
    "msg": msg
  }));
}