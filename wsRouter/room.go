package wsRouter

import (
	"strconv"
	"sync"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/constant"
)

type Room struct {
	mutex       sync.RWMutex
	updateCount int32

	id       int
	name     string
	game     string
	password string
	state    int

	playerCount   int32
	players       []*User
	playerNames   []string
	playerAvatars []string
	playerStates  []int
	hostName      string
	hostID        int
	// keyboardsLog [][][]Keyboard // 玩家id，
}

func enterRoom(u *User, r *Room, idInRoom int) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	u.idInRoom = idInRoom
	u.room = r
	r.playerCount++
	u.state = "房间中，" + r.game
	r.players[idInRoom] = u
	r.playerNames[idInRoom] = u.name
	r.playerAvatars[idInRoom] = u.avatar
	r.playerStates[idInRoom] = constant.ROOM_PLAYER_STATE_UNREADY
}

func leaveRoom(u *User) *Room {
	r := u.room
	if r == nil {
		return nil
	}
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.players[u.idInRoom] = nil
	r.playerCount--
	r.playerNames[u.idInRoom] = ""
	r.playerAvatars[u.idInRoom] = constant.ROOM_AVATAR_TOPN
	r.playerStates[u.idInRoom] = constant.ROOM_PLAYER_STATE_EMPTY
	if r.hostID == u.idInRoom {
		for id, user := range r.players {
			if user != nil {
				r.hostID = id
				r.hostName = user.name
				break
			}
		}
	}
	if r.playerCount == 0 {
		delRoom(r.id)
	}
	u.room = nil
	u.idInRoom = -1
	return r
}

func ready(u *User) {
	u.room.mutex.Lock()
	u.room.playerStates[u.idInRoom] = constant.ROOM_PLAYER_STATE_READY
	u.room.mutex.Unlock()
}

func unready(u *User) {
	u.room.mutex.Lock()
	u.room.playerStates[u.idInRoom] = constant.ROOM_PLAYER_STATE_UNREADY
	u.room.mutex.Unlock()
}

func start(u *User) {
	u.room.mutex.Lock()
	u.room.state = constant.ROOM_STATE_IN_GAME
	for id, user := range u.room.players {
		if user!=nil {
			u.room.playerStates[id] = constant.ROOM_PLAYER_STATE_IN_GAME
			user.state = "游戏中，" + u.room.name
		}
	}
	u.room.mutex.Unlock()
}

func (u *User) enterRoom(m map[string]interface{}) {
	if roomIDstr, ok := m["roomID"].(string); !ok {
		logger.Warn(u.name + ", expect roomID in enterRoom")
	} else {
		roomID, _ := strconv.Atoi(roomIDstr)
		r := getRoom(roomID)
		if r == nil {
			u.msg <- map[string]interface{}{
				"type":   "roomMsg",
				"errMsg": "房间不存在",
			}
			return
		}
		if u.idInRoom != -1 {
			u.sendRoomMsg(map[string]interface{}{
				"type": "roomMsg",
				"msg":  "玩家 " + u.name + " 进入了房间",
				"room": roomInfo(r),
			}, "系统消息", true)
			sendRoomList()
			return
		}
		for idInRoom, user := range r.players {
			if user == nil {
				enterRoom(u, r, idInRoom)
				u.sendRoomMsg(map[string]interface{}{
					"type": "roomMsg",
					"msg":  "玩家 " + u.name + " 进入了房间",
					"room": roomInfo(r),
				}, "系统消息", true)
				sendRoomList()
				return
			}
		}
		u.msg <- map[string]interface{}{
			"type":   "roomMsg",
			"errMsg": "房间已满",
		}
	}
}

func (u *User) leaveRoom() {
	r := leaveRoom(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"msg":  "玩家 " + u.name + " 离开了房间",
		"room": roomInfo(r),
	}, "系统消息", true)
	sendRoomList()
}

func (u *User) ready() {
	ready(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room": roomInfo(u.room),
	}, u.name, true)
	sendRoomList()
}

func (u *User) unready() {
	unready(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room": roomInfo(u.room),
	}, u.name, true)
	sendRoomList()
}

func (u *User) start() {
	start(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room": roomInfo(u.room),
	}, u.name, true)
	sendRoomList()
}

func (u *User) keyboard(m map[string]interface{}) {
	u.sendRoomMsg(m, u.name, false)
}

func (u *User) sendRoomMsg(m map[string]interface{}, from string, sendToSelf bool) {
	m["from"] = from
	for _, user := range u.room.players {
		if user == nil {
			continue
		}
		if user == u && !sendToSelf {
			continue
		}
		select {
		case user.msg <- m:
			user.msg <- map[string]interface{}{
				"type":     "roomMsg",
				"idInRoom": user.idInRoom,
			}
		default:
			delUser(user)
			close(user.msg)
		}
	}
}
