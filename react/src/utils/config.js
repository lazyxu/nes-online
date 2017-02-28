var port = document.location.port;
var host = document.location.hostname;
if (port != "") {
  host = host + ':' + port;
}
module.exports = {
  wsServer: 'ws://' + host + '/ws'
  // wsServer: 'ws://localhost:8080/ws'
}