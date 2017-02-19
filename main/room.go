package main

import "strconv"

func getRoomList() map[string]interface{} {
	rooms := map[string]interface{}{}
	for _, r := range h.rooms {
		rooms[strconv.Itoa(r.id)] = r.roomlistInfo()
	}
	return rooms
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

func (r *Room) roomlistInfo() map[string]interface{} {
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
	return map[string]interface{}{
		"id":     r.id,
		"name":   r.name,
		"host":   host,
		"game":   r.game,
		"number": strconv.Itoa(count) + "/" + strconv.Itoa(len(r.players)),
		"state":  r.state,
	}
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
	u.broadcast(map[string]interface{}{
		"type":     "createRoom",
		"room":     h.rooms[roomID].roomInfo(),
		"roomlist": h.rooms[roomID].roomlistInfo(),
	})
}

func (u *User) enterRoom(m map[string]interface{}) {
	roomID, _ := strconv.Atoi(m["roomID"].(string))
	for index, user := range h.rooms[roomID].players {
		if user == nil {
			u.room = h.rooms[roomID]
			u.state = ""
			h.rooms[roomID].players[index] = u
			u.broadcast(map[string]interface{}{
				"type":     "enterRoom",
				"room":     h.rooms[roomID].roomInfo(),
				"roomlist": h.rooms[roomID].roomlistInfo(),
			})
		}
	}
}

func (u *User) leaveRoom() {
	if u.room == nil {
		return
	}
	roomID := u.room.id
	userName := u.name
	for index, p := range u.room.players {
		if p == u {
			u.room.players[index] = nil
			break
		}
	}
	empty := true
	for _, p := range u.room.players {
		if p == u {
			continue
		}
		if p != nil {
			p.state = "房主"
			empty = false
			break
		}
	}
	if empty {
		delete(h.rooms, u.room.id)
		u.broadcast(map[string]interface{}{
			"type":     "leaveRoom",
			"userName": userName,
			"roomID":   u.room.id,
			"roomlist": "empty",
		})
	} else {
		u.broadcast(map[string]interface{}{
			"type":     "leaveRoom",
			"userName": userName,
			"room":     h.rooms[roomID].roomInfo(),
			"roomlist": h.rooms[roomID].roomlistInfo(),
		})
	}
	u.room = nil
}

func (u *User) ready() {
	u.state = "已准备"
	u.broadcast(map[string]interface{}{
		"type":     "updateRoom",
		"room":     u.room.roomInfo(),
		"roomlist": u.room.roomlistInfo(),
	})
}

func (u *User) unready() {
	u.state = ""
	u.broadcast(map[string]interface{}{
		"type":     "updateRoom",
		"room":     u.room.roomInfo(),
		"roomlist": u.room.roomlistInfo(),
	})
}

func (u *User) start() {
	u.room.state = "游戏中"
	var keyboard []interface{}
	for _, p := range u.room.players {
		keyboard = append(keyboard, getKeyboard(p.name))
	}
	u.broadcast(map[string]interface{}{
		"type":     "start",
		"room":     u.room.roomInfo(),
		"roomlist": u.room.roomlistInfo(),
		"keyboard": keyboard,
	})
}

func (u *User) keyboard() {
	index := 1
	for _, user := range u.room.players {
		if u == user {
			break
		}
		index++
	}

}
func (u *User) sendRoomMsg(m map[string]interface{}) {
	m["from"] = u.name
	for _, user := range u.room.players {
		if user == nil {
			continue
		}
		select {
		case user.msg <- m:
		default:
			delete(h.users, user.name)
			close(user.msg)
		}
	}
}
