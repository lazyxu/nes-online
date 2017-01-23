    
var ws = null;
var open = false;

exports.createWS = function () {
    if (window["WebSocket"]) {
        ws = new WebSocket('ws://localhost:8080/ws');
        ws.onopen = () => {
            open = true;
            ws.send(JSON.stringify({
                "Handle": "Msg",
                "Msg": "open"
            }));
        };

        ws.onmessage = (e) => {
        console.log(e.data);
        };

        ws.onerror = (e) => {
        console.log(e.message);
        };

        ws.onclose = (e) => {
        console.log(e.code, e.reason);
        };
    }
}

exports.send = function (msg) {
    ws.send(JSON.stringify(msg));
}