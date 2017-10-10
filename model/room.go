package model

import (
	"strconv"
	"sync/atomic"
)

type Room struct {
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

const (
	ROOM_STATE_NORMAL = iota
	ROOM_STATE_IN_GAME
)

const (
	ROOM_PLAYER_STATE_EMPTY   = iota
	ROOM_PLAYER_STATE_UNREADY
	ROOM_PLAYER_STATE_READY
	ROOM_PLAYER_STATE_IN_GAME
)

const ROOM_AVATAR_TOPN = "/img/open.png"

func (u *User) sendRoomList() {
	u.msg <- map[string]interface{}{
		"type":     "roomList",
		"roomList": roomlist(),
	}
}

// createRoom - "type": "createRoom", "game": game
func (u *User) createRoom(m map[string]interface{}) {
	h.roomCount++
	roomID := h.roomCount
	game := m["game"].(string)
	u.state = "房间中，" + game
	u.idInRoom = 0
	h.rooms[roomID] = &Room{
		id:            roomID,
		name:          u.name,
		game:          game,
		password:      "",
		state:         ROOM_STATE_NORMAL,
		playerCount:   1,
		players:       []*User{u, nil},
		playerNames:   []string{u.name, ""},
		playerAvatars: []string{u.avatar, ROOM_AVATAR_TOPN},
		playerStates:  []int{ROOM_PLAYER_STATE_UNREADY, ROOM_PLAYER_STATE_EMPTY},
		hostName:      u.name,
		hostID:        u.idInRoom,
	}
	u.room = h.rooms[roomID]
	u.msg <- map[string]interface{}{
		"type": "createRoom",
		"room": roomInfo(u.room),
	}
}

func (u *User) enterRoom(m map[string]interface{}) {
	sroomID, _ := m["roomID"].(string)
	roomID, _ := strconv.Atoi(sroomID)
	if _, ok := h.rooms[roomID]; !ok {
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
			"room": roomInfo(u.room),
		}, "系统消息", true)
		sendRoomList()
		return
	}
	for id, user := range h.rooms[roomID].players {
		if user == nil {
			u.idInRoom = id
			u.room = h.rooms[roomID]
			atomic.AddInt32(&u.room.playerCount, 1)
			u.state = "房间中，" + u.room.game
			u.room.players[id] = u
			u.room.playerNames[id] = u.name
			u.room.playerAvatars[id] = u.avatar
			u.room.playerStates[id] = ROOM_PLAYER_STATE_UNREADY
			u.sendRoomMsg(map[string]interface{}{
				"type": "roomMsg",
				"msg":  "玩家 " + u.name + " 进入了房间",
				"room": roomInfo(u.room),
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

func (u *User) leaveRoom() {
	if u.room == nil {
		return
	}
	u.room.players[u.idInRoom] = nil
	atomic.AddInt32(&u.room.playerCount, -1)
	u.room.playerNames[u.idInRoom] = ""
	u.room.playerAvatars[u.idInRoom] = ROOM_AVATAR_TOPN
	u.room.playerStates[u.idInRoom] = ROOM_PLAYER_STATE_EMPTY
	if u.room.hostID == u.idInRoom {
		for id, user := range u.room.players {
			if user != nil {
				u.room.hostID = id
				u.room.hostName = user.name
				break
			}
		}
	}
	if atomic.LoadInt32(&u.room.playerCount) == 0 {
		delete(h.rooms, u.room.id)
	}
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"msg":  "玩家 " + u.name + " 离开了房间",
		"room": roomInfo(u.room),
	}, "系统消息", true)
	sendRoomList()
	u.room = nil
	u.idInRoom = -1
}

func (u *User) ready() {
	u.room.playerStates[u.idInRoom] = ROOM_PLAYER_STATE_READY
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room": roomInfo(u.room),
	}, u.name, true)
	sendRoomList()
}

func (u *User) unready() {
	u.room.playerStates[u.idInRoom] = ROOM_PLAYER_STATE_UNREADY
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room": roomInfo(u.room),
	}, u.name, true)
	sendRoomList()
}

func (u *User) start() {
	u.room.state = ROOM_STATE_IN_GAME
	for id, user := range u.room.players {
		u.room.playerStates[id] = ROOM_PLAYER_STATE_IN_GAME
		user.state = "游戏中，" + u.room.name
	}
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
			user.updateIdInRoom()
		default:
			delete(h.users[u.typ], user.name)
			close(user.msg)
		}
	}
}

func (u *User) updateIdInRoom() {
	u.msg <-map[string]interface{}{
		"type": "roomMsg",
		"idInRoom": u.idInRoom,
	}
}
