package main

// createRoom - "type": "createRoom", "game": game
func (u *User) createRoom(m map[string]interface{}) {
	h.roomCount++
	roomID := h.roomCount
	h.rooms[roomID] = &Room{
		id:       roomID,
		game:     m["game"].(string),
		name:     u.name,
		host:     0,
		password: "",
		state:    0,
		players:  []*User{u, nil},
	}
	u.room = h.rooms[roomID]
	u.broadcast(map[string]interface{}{
		"type": "createRoom",
		"room": map[string]interface{}{
			"id":       roomID,
			"game":     m["game"].(string),
			"name":     u.name,
			"host":     0,
			"password": "",
			"state":    0,
			"players": []interface{}{
				map[string]interface{}{
					"name":   u.name,
					"avatar": u.avatar,
					"state":  "房主",
				},
				nil,
			},
		},
	})
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
