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

	ID       int    `json:"id"`
	Name     string `json:"name"`
	Game     string `json:"game"`
	password string
	State    int    `json:"state"`

	PlayerCount int32   `json:"player_count"`
	Players     []*User `json:"players"`
	HostID      int     `json:"host_id"`
	// keyboardsLog [][][]Keyboard // 玩家id，
}

func enterRoom(u *User, r *Room, idInRoom int) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	u.IdInRoom = idInRoom
	u.room = r
	r.PlayerCount++
	u.State = "房间中，" + r.Game
	u.StateInRoom = constant.ROOM_PLAYER_STATE_UNREADY
	r.Players[idInRoom] = u
}

func leaveRoom(u *User) {
	r := u.room
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.Players[u.IdInRoom] = nil
	r.PlayerCount--
	if r.HostID == u.IdInRoom {
		for id, user := range r.Players {
			if user != nil {
				r.HostID = id
				break
			}
		}
	}
	if r.PlayerCount == 0 {
		delRoom(r.ID)
	}
	u.room = nil
	u.IdInRoom = -1
	if r != nil && r.State == constant.ROOM_STATE_IN_GAME {
		updateRoomState(r)
	}
}

func ready(u *User) {
	u.room.mutex.Lock()
	defer u.room.mutex.Unlock()
	u.StateInRoom = constant.ROOM_PLAYER_STATE_READY
}

func unready(u *User) {
	u.room.mutex.Lock()
	defer u.room.mutex.Unlock()
	u.StateInRoom = constant.ROOM_PLAYER_STATE_UNREADY
}

func start(u *User) {
	u.room.mutex.Lock()
	defer u.room.mutex.Unlock()
	u.room.State = constant.ROOM_STATE_IN_GAME
	for _, user := range u.room.Players {
		if user != nil {
			user.StateInRoom = constant.ROOM_PLAYER_STATE_IN_GAME
			user.State = "游戏中，" + u.room.Game
		}
	}
}

func endGame(u *User) {
	u.room.mutex.Lock()
	defer u.room.mutex.Unlock()
	u.StateInRoom = constant.ROOM_PLAYER_STATE_UNREADY
	updateRoomState(u.room)
}

func (u *User) createRoom(m map[string]interface{}) {
	if game, ok := m["game"].(string); !ok {
		logger.Warn(u.Name + ", expect game in createRoom")
	} else {
		createRoom(u, game)
		u.msg <- map[string]interface{}{
			"type": "createRoom",
			"room": u.room,
		}
	}
	sendRoomList()
}

func (u *User) enterRoom(m map[string]interface{}) {
	if !checkUser(u) {
		return
	}
	if roomIDstr, ok := m["roomID"].(string); !ok {
		logger.Warn(u.Name + ", expect roomID in enterRoom")
	} else {
		roomID, _ := strconv.Atoi(roomIDstr)
		r := getRoom(roomID)
		if r == nil {
			u.msg <- map[string]interface{}{
				"type":       "roomErrMsg",
				"roomErrMsg": "房间不存在",
			}
			return
		}
		if r.State == constant.ROOM_STATE_NORMAL {
			if u.IdInRoom != -1 {
				sendRoomMsg(u.room, map[string]interface{}{
					"type": "roomStateChange",
					"room": r,
				})
				sendRoomMsg(u.room, map[string]interface{}{
					"type": "roomMsg",
					"msg":  "玩家 " + u.Name + " 进入了房间",
				})
				sendRoomList()
				return
			}
			for idInRoom, user := range r.Players {
				if user == nil {
					enterRoom(u, r, idInRoom)
					sendRoomMsg(u.room, map[string]interface{}{
						"type": "roomStateChange",
						"room": r,
					})
					sendRoomMsg(u.room, map[string]interface{}{
						"type": "roomMsg",
						"msg":  "玩家 " + u.Name + " 进入了房间",
					})
					sendRoomList()
					return
				}
			}
			u.msg <- map[string]interface{}{
				"type":       "roomErrMsg",
				"roomErrMsg": "房间已满",
			}
		} else {
			u.msg <- map[string]interface{}{
				"type":       "roomErrMsg",
				"roomErrMsg": "暂不支持观战模式",
			}
		}
	}
}

func (u *User) leaveRoom() {
	r := u.room
	if r == nil {
		return
	}
	leaveRoom(u)
	sendRoomMsg(r, map[string]interface{}{
		"type": "roomStateChange",
		"room": r,
	})
	sendRoomMsg(r, map[string]interface{}{
		"type": "roomMsg",
		"msg":  "玩家 " + u.Name + " 离开了房间",
	})
	sendRoomList()
}

func (u *User) endGame() {
	r := u.room
	if r == nil {
		return
	}
	endGame(u)
	sendRoomMsg(r, map[string]interface{}{
		"type": "roomStateChange",
		"room": r,
	})
	sendRoomMsg(r, map[string]interface{}{
		"type": "roomMsg",
		"msg":  "玩家 " + u.Name + " 退出了游戏",
	})
	sendRoomList()
}

func (u *User) ready() {
	ready(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomStateChange",
		"room": u.room,
	}, u.Name, true)
	sendRoomList()
}

func (u *User) unready() {
	unready(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomStateChange",
		"room": u.room,
	}, u.Name, true)
	sendRoomList()
}

func (u *User) start() {
	start(u)
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomStateChange",
		"room": u.room,
	}, u.Name, true)
	sendRoomList()
}

func (u *User) keyboard(m map[string]interface{}) {
	u.sendRoomMsg(m, u.Name, false)
}

func (u *User) sendRoomMsg(m map[string]interface{}, from string, sendToSelf bool) {
	m["from"] = from
	if u.room == nil {
		logger.Warn("不在该房间中")
		return
	}
	for _, user := range u.room.Players {
		if user == nil {
			continue
		}
		if user == u && !sendToSelf {
			continue
		}
		select {
		case user.msg <- m:
		default:
			u.out()
		}
	}
}

func sendRoomMsg(r *Room, m map[string]interface{}) {
	m["from"] = "系统"
	if r == nil {
		logger.Warn("该房间不存在")
		return
	}
	for _, user := range r.Players {
		if user == nil {
			continue
		}
		select {
		case user.msg <- m:
			user.msg <- map[string]interface{}{
				"type":       "id_in_room",
				"id_in_room": user.IdInRoom,
			}
		default:
			user.out()
		}
	}
}