package model

import (
	"strconv"
)

type Room struct {
	id       int
	name     string
	game     string
	password string
	state    string
	players  []*User
	// keyboardsLog [][][]Keyboard // 玩家id，
}

func (u *User) sendRoomList() {
	u.msg <- map[string]interface{}{
		"type":     "roomList",
		"roomList": roomlist(),
	}
}

func sendRoomList() {
	broadcast(map[string]interface{}{
		"type":     "roomList",
		"roomList": roomlist(),
	})
}

func (r *Room) updateRoomState() {
	if r.state == "游戏中" {
		return
	}
	for _, p := range r.players {
		if p != nil && p.state == "" {
			r.state = "等待准备"
			return
		}
	}
	r.state = "等待开始"
}

func roomlist() []interface{} {
	roomlistInfo := []interface{}{}
	for _, r := range h.rooms {
		count := 0
		host := ""
		for _, p := range r.players {
			if p != nil {
				count++
				if p.state == "房主" {
					host = p.name
				}
			}
		}
		r.updateRoomState()
		roomlistInfo = append(roomlistInfo, map[string]interface{}{
			"id":     r.id,
			"name":   r.name,
			"host":   host,
			"game":   r.game,
			"number": strconv.Itoa(count) + "/" + strconv.Itoa(len(r.players)),
			"state":  r.state,
		})
	}
	return roomlistInfo
}

func (r *Room) roomInfo() map[string]interface{} {
	players := []interface{}{}
	host := ""
	for _, p := range r.players {
		if p == nil {
			players = append(players, nil)
		} else {
			if p.state == "房主" {
				host = p.name
			}
			players = append(players, map[string]interface{}{
				"name":   p.name,
				"avatar": p.avatar,
				"state":  p.state,
			})
		}
	}
	r.updateRoomState()
	return map[string]interface{}{
		"id":      r.id,
		"game":    r.game,
		"name":    r.name,
		"host":    host,
		"players": players,
		"state":   r.state,
	}
}

// createRoom - "type": "createRoom", "game": game
func (u *User) createRoom(m map[string]interface{}) {
	h.roomCount++
	roomID := h.roomCount
	h.rooms[roomID] = &Room{
		id:       roomID,
		game:     m["game"].(string),
		name:     u.name,
		password: "",
		state:    "初始化",
		players:  []*User{u, nil},
	}
	u.room = h.rooms[roomID]
	u.state = "房主"
	u.idInRoom = 0
	u.msg <- map[string]interface{}{
		"type": "createRoom",
		"room": h.rooms[roomID].roomInfo(),
	}
}

func (u *User) enterRoom(m map[string]interface{}) {
	sroomID, _ := m["roomID"].(string)
	roomID, _ := strconv.Atoi(sroomID)
	if _, ok := h.rooms[roomID]; !ok {
		u.msg <- map[string]interface{}{
			"type": "roomMsg",
			"errMsg": "房间不存在",
		}
		return
	}
	flag := false
	for index, user := range h.rooms[roomID].players {
		if user == u {
			flag = true
			break
		} else if user == nil {
			flag = true
			u.idInRoom = index
			u.room = h.rooms[roomID]
			u.state = ""
			h.rooms[roomID].players[index] = u
			break
		}
	}
	if flag {
		u.sendRoomMsg(map[string]interface{}{
			"type": "roomMsg",
			"msg":  "玩家 " + u.name + " 进入了房间",
			"room": u.room.roomInfo(),
		}, "系统消息", true)
		sendRoomList()
	} else {
		u.msg <- map[string]interface{}{
			"type": "roomMsg",
			"errMsg": "房间已满",
		}
	}
}

func (u *User) leaveRoom() {
	if u.room == nil {
		return
	}
	for index, p := range u.room.players {
		if p == u {
			u.room.players[index] = nil
			break
		}
	}
	empty := true
	for _, p := range u.room.players {
		if p != nil {
			if u.state == "房主" {
				p.state = "房主"
			}
			empty = false
			break
		}
	}
	if empty {
		delete(h.rooms, u.room.id)
	}
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"msg":  "玩家 " + u.name + " 离开了房间",
		"room": u.room.roomInfo(),
	}, "系统消息", true)
	sendRoomList()
	u.room = nil
}

func (u *User) ready() {
	u.state = "已准备"
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room":     u.room.roomInfo(),
	}, u.name, true)
	sendRoomList()
}

func (u *User) unready() {
	u.state = ""
	u.sendRoomMsg(map[string]interface{}{
		"type": "roomMsg",
		"room":     u.room.roomInfo(),
	}, u.name, true)
	sendRoomList()
}

func (u *User) start() {
	u.room.state = "游戏中"
	var keyboard []interface{}
	// for _, p := range u.Room.players {
	// 	if p != nil {
	// 		keyboard = append(keyboard, getKeyboard(p.Name))
	// 	} else {
	// 		keyboard = append(keyboard, nil)
	// 	}
	// }
	u.broadcast(map[string]interface{}{
		"type":     "start",
		"room":     u.room.roomInfo(),
		"keyboard": keyboard,
	})
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
		default:
			delete(h.users[u.typ], user.name)
			close(user.msg)
		}
	}
}
