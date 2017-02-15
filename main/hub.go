package main

import (
	"log"

	"github.com/gorilla/websocket"
)

type Hub struct {
	users     map[string]*User
	rooms     map[int]*Room
	roomCount int
}

type User struct {
	name   string
	avatar string
	room   *Room
	ws     *websocket.Conn
	msg    chan map[string]interface{}
}

type Room struct {
	id       int
	name     string
	game     string
	host     int
	password string
	state    int
	players  []*User
}

var h = Hub{
	users: make(map[string]*User),
	rooms: make(map[int]*Room),
}

func (h *Hub) init() {
	h.roomCount = 10000
	h.users["MeteorKL"] = &User{
		name:   "MeteorKL",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["官方客服"] = &User{
		name:   "官方客服",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["0xcccc"] = &User{
		name:   "0xcccc",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["666"] = &User{
		name:   "666",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["233"] = &User{
		name:   "233",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["555"] = &User{
		name:   "555",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
	h.users["🐷"] = &User{
		name:   "🐷",
		avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	}
}

func (u *User) register(m map[string]interface{}) {
	user := m["user"].(map[string]interface{})
	u.avatar = user["avatar"].(string)
	u.name = user["name"].(string)
	u.room = nil
	h.users[u.name] = u
	u.broadcast(m)
}

func (u *User) unregister() {
	delete(h.users, u.name)
	close(u.msg)
	u.broadcast(map[string]interface{}{
		"type":     "out",
		"userName": u.name,
	})
}

func (u *User) broadcast(m map[string]interface{}) {
	m["from"] = u.name
	log.Println("broadcast: ", m)
	for _, user := range h.users {
		select {
		case user.msg <- m:
		default:
			// delete(h.users, user.name)
			// close(user.msg)
		}
	}
}
