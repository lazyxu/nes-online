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

exports.ROOM_STATE_TEXT = ['等待开始','游戏中']

exports.INIT_USER_STATE = {
  type: exports.USER_UNLOGIN
}
var host = document.location.host
var redirect_uri = 'http://nes.meteorkl.com'+document.location.pathname+document.location.hash
exports.wsServer = 'ws://' + host + '/ws'
exports.qqRedirectURL = escape('http://'+host+'/api/loginQQ?redirect_uri='+escape(redirect_uri))
exports.DEFAULT_KEYBOARD = {
  "up":     87,
	"down":   83,
	"left":   65,
	"right":  68,
	"select": 86,
	"start":  66,
	"A":      75,
	"B":      74,
	"X":      73,
	"Y":      85,
}

exports.LOADINGROOM = 0
exports.LOADINGMAP = 1
exports.LOADED = 2


exports.ROOM_AVATAR_TOPN = "/img/open.png"