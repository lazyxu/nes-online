exports.USER_UNLOGIN = -1
exports.USER_VISITOR = 0
exports.USER_LOGIN = 1

exports.ROOM_PLAYER_STATE_EMPTY = 0
exports.ROOM_PLAYER_STATE_UNREADY = 1
exports.ROOM_PLAYER_STATE_READY = 2
exports.ROOM_PLAYER_STATE_IN_GAME = 3

exports.ROOM_PLAYER_STATE_TEXT = ['','','已准备','游戏中']

exports.ROOM_STATE_NORMAL = 0
exports.ROOM_STATE_IN_GAME = 1

exports.INIT_USER_STATE = {
  type: exports.USER_UNLOGIN
}
var host = document.location.host
var redirect_uri = 'http://nes.meteorkl.com'+document.location.pathname+document.location.hash
exports.wsServer = 'ws://' + host + '/ws'
exports.qqRedirectURL = escape('http://'+host+'/api/loginQQ?redirect_uri='+escape(redirect_uri))