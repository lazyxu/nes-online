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
	name     string
	avatar   string
	room     *Room
	ws       *websocket.Conn
	msg      chan map[string]interface{}
	state    string
	idInRoom int
}

type Room struct {
	id       int
	name     string
	game     string
	password string
	state    string
	players  []*User
	// keyboardsLog [][][]Keyboard // 玩家id，
}

// type Keyboard struct {
// 	key   int
// 	value int
// }

var h = Hub{
	users: make(map[string]*User),
	rooms: make(map[int]*Room),
}

func (h *Hub) init() {
	h.roomCount = 10000
	// h.users["MeteorKL"] = &User{
	// 	name:   "MeteorKL",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["官方客服"] = &User{
	// 	name:   "官方客服",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["0xcccc"] = &User{
	// 	name:   "0xcccc",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["666"] = &User{
	// 	name:   "666",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["233"] = &User{
	// 	name:   "233",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["555"] = &User{
	// 	name:   "555",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["🐷"] = &User{
	// 	name:   "🐷",
	// 	avatar: "/img/avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
}

func (u *User) register(m map[string]interface{}) {
	user := m["user"].(map[string]interface{})
	u.avatar = user["avatar"].(string)
	u.name = user["name"].(string)
	u.room = nil
	u.state = "在线"
	if user, ok := h.users[u.name]; ok {
		user.ws.WriteJSON(map[string]interface{}{
			"type": "relogin",
		})
		user.unregister()
	}
	h.users[u.name] = u
	log.Println(h.users)
	u.broadcast(m)
	users := map[string]interface{}{}
	for _, user := range h.users {
		users[user.name] = map[string]interface{}{
			"name":   user.name,
			"avatar": user.avatar,
		}
	}
	u.msg <- map[string]interface{}{
		"type":  "userlist",
		"users": users,
	}
	u.msg <- map[string]interface{}{
		"type":     "info",
		"roomlist": getRoomList(),
		"gamelist": getGameList(),
		"keyboard": getKeyboard(u.name),
	}
}

func (u *User) unregister() {
	u.leaveRoom()
	if h.users[u.name] == u {
		delete(h.users, u.name)
	}
	u.broadcast(map[string]interface{}{
		"type":     "out",
		"userName": u.name,
	})
}

func (u *User) broadcast(m map[string]interface{}) {
	m["from"] = u.name
	// log.Println("broadcast: ", m)
	for _, user := range h.users {
		if user.msg == nil {
			log.Println("channel is nil")
			user.unregister()
		}
		select {
		case user.msg <- m:
		default:
			log.Println("channel is full !")
			// delete(h.users, user.name)
			// close(user.msg)
		}
	}
}
