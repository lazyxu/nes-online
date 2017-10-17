exports.USER_UNLOGIN = -1
exports.USER_VISITOR = 0
exports.USER_LOGIN = 1

exports.ROOM_PLAYER_STATE_EMPTY = 0
exports.ROOM_PLAYER_STATE_UNREADY = 1
exports.ROOM_PLAYER_STATE_READY = 2
exports.ROOM_PLAYER_STATE_IN_GAME = 3

exports.ROOM_PLAYER_STATE_TEXT = ['', '', '已准备', '游戏中']

exports.ROOM_STATE_NORMAL = 0
exports.ROOM_STATE_IN_GAME = 1

exports.ROOM_STATE_TEXT = ['等待开始', '游戏中']

exports.INIT_USER_STATE = {
	type: exports.USER_UNLOGIN
}
var host = document.location.host
var redirect_uri = 'http://nes.meteorkl.com' + document.location.pathname + document.location.hash
exports.wsServer = 'ws://' + host + '/ws'
exports.qqRedirectURL = escape('http://' + host + '/api/loginQQ?redirect_uri=' + escape(redirect_uri))

exports.LOCAL = 0
exports.WEBSOCKET = 1
exports.PEER_CONNECTION = 2

exports.DEFAULT_KEYBOARD = {
	"up": 87,
	"down": 83,
	"left": 65,
	"right": 68,
	"select": 86,
	"start": 66,
	"A": 75,
	"B": 74,
	"X": 73,
	"Y": 85,
}

exports.LOADINGROOM = 0
exports.LOADINGMAP = 1
exports.LOADED = 2


exports.ROOM_AVATAR_TOPN = "/img/open.png"

exports.KEYCODE_TABLE = {
	27: 'Escape',
	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	120: 'F9',
	121: 'F10',
	192: '`',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	48: '0',
	189: '-',
	187: '=',
	8: 'Backspace',
	9: 'Tab',
	81: 'Q',
	87: 'W',
	69: 'E',
	82: 'R',
	84: 'T',
	89: 'Y',
	85: 'U',
	73: 'I',
	79: 'O',
	80: 'P',
	219: '[',
	221: ']',
	220: '\\',
	20: 'CapsLock',
	65: 'A',
	83: 'S',
	68: 'D',
	70: 'F',
	71: 'G',
	72: 'H',
	74: 'J',
	75: 'K',
	76: 'L',
	186: ';',
	222: '\'',
	13: 'Enter',
	16: 'Shift',
	90: 'Z',
	88: 'X',
	67: 'C',
	86: 'V',
	66: 'B',
	78: 'N',
	77: 'M',
	188: ',',
	190: '.',
	191: '/',
	17: 'Control',
	18: 'Alt',
	91: 'Meta',
	32: ' ',
	38: 'ArrowUp',
	40: 'ArrowDown',
	37: 'ArrowLeft',
	39: 'ArrowRight',
}