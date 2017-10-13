package constant


const USER_UNLOGIN = -1
const USER_VISITOR = 0
const USER_LOGIN = 1
const USER_MAX = 2

const DEFAULT_AVATAR_URL = "/img/avatar/questionMark.jpg"
var DEFAULT_KEYBOARD = map[string]interface{}{
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

const (
	ROOM_STATE_NORMAL  = iota
	ROOM_STATE_IN_GAME
)

const (
	ROOM_PLAYER_STATE_EMPTY   = iota
	ROOM_PLAYER_STATE_UNREADY
	ROOM_PLAYER_STATE_READY
	ROOM_PLAYER_STATE_IN_GAME
)

const ROOM_AVATAR_TOPN = "/img/open.png"