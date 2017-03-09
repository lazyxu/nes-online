import config from './config'
import store from '../store.js'
import actions from '../actions/actions.js'

window.ws = null;
window.wsHandler={};

window.wsHandler['settingUpdate'] = data => {
  store.dispatch(actions.keyboardSet(data.keyboard == null?new Object():data.keyboard));
  store.dispatch(actions.userSet(data.name));
}
window.wsHandler['info'] = data => {
  store.dispatch(actions.roomlistSet(data.roomlist == null?new Object():data.roomlist));
  store.dispatch(actions.gamelistSet(data.gamelist == null?new Array():data.gamelist));
  store.dispatch(actions.keyboardSet(data.keyboard == null?new Object():data.keyboard));
}

window.wsHandler['createRoom'] = data => {
  store.dispatch(actions.roomlistUpdate(data.roomlist));
  if (data.from == store.getState().user.name) {
    store.dispatch(actions.roomSet(data.room));
    store.dispatch(actions.userUpdate("idInRoom", data.idInRoom));
    store.dispatch(actions.tabSet('Room'));
  }
}
window.wsHandler["leaveRoom"] = data => {
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
window.wsHandler['enterRoom'] = data => {
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
window.wsHandler['updateRoom'] = data => {
  store.dispatch(actions.roomlistUpdate(data.roomlist));
  if (data.room != null && store.getState().room != null && data.room.id == store.getState().room.id) {
    store.dispatch(actions.roomSet(data.room));
  }
}
window.wsHandler["start"] = data => {
  if (data.room != null && store.getState().room != null && data.room.id == store.getState().room.id) {
    store.dispatch(actions.tabSet("Game", true));
    if (typeof data.keyboard[0]!=="undefined") {
      window.nes.keyboard.player[0] = data.keyboard[0];
    }
    if (typeof data.keyboard[1]!=="undefined") {
      window.nes.keyboard.player[1] = data.keyboard[1];
    }
    var players = window.store.getState().room.players;
    window.keyboardAction = new Array(players.length);
    var frameDelay = 6;
    for (var i=0;i<players.length;i++) {
        if (players[i]!=null) {
            window.keyboardAction[i] = new Array(frameDelay);
            for (var j=0; j<frameDelay; j++) {
                window.keyboardAction[i][j] = [];
            }
        }
    }
    var idInRoom = window.store.getState().user.idInRoom;
    window.keyboardAction[idInRoom].push([]);
    console.log(window.keyboardAction);
  }
}
window.wsHandler["relogin"] = data => {
  alert("你的账号在异地登录，如果不是你本人操作，请及时修改密码");
  location.reload(true);
}
window.wsHandler["keyboard"]= data => {
  keyboardActionSet(data);
}
exports.createWS = user => {
  if (window["WebSocket"]) {
    ws = new WebSocket(config.wsServer);

    ws.onopen = () => {
      console.log("WebSocket已经打开...");
    };

    ws.onmessage = (e) => {
      var json=JSON.parse(e.data);
      if (json.type!="keyboard")
        console.log(json);
      for (var type in wsHandler) {
        if (json.type==type)
          window.wsHandler[type](json);
      }
    };

    ws.onerror = (e) => {
      console.log(e.message);
    };

    ws.onclose = (e) => {
      console.log(e.code, e.reason);
      console.log("WebSocket已经断开，请重新登录");
      location.href = "#/login";
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