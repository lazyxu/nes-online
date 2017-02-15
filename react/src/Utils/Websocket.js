import config from './config'

var ws = null;
var wsHandler={};
exports.createWS = (user) => {
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

exports.send = (content) => {
  ws.send(JSON.stringify(content));
}

exports.sendRoomMsg = (msg) => {
  ws.send(JSON.stringify({
    "type": "roomMsg",
    "msg": msg
  }));
}