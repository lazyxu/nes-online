var port = document.location.port;
var host = document.location.hostname;
if (port != "") {
  host = host + ':' + port;
}
module.exports = {
  wsServer: 'ws://' + host + '/ws',
  qqRedirectURL: 'http://'+host+'/loginQQ',
}