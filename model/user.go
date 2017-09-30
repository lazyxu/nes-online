package model

import (
	"github.com/gorilla/websocket"
	"log"
)

type User struct {
	typ      string
	name     string
	avatar   string
	room     *Room
	ws       *websocket.Conn
	msg      chan map[string]interface{}
	state    string
	idInRoom int
}

func UserHandler(ws *websocket.Conn, user map[string]interface{}) {
	u := &User{
		msg:    make(chan map[string]interface{}, 256),
		ws:     ws,
		name:   user["name"].(string),
		avatar: user["avatar"].(string),
	}
	u.Register()
	defer func() {
		u.Unregister()
		close(u.msg)
	}()
	go u.Writer()
	u.Reader()
}

// client send Msg to server
func (u *User) Reader() {
	for {
		m := make(map[string]interface{})
		err := u.ws.ReadJSON(&m)
		if err != nil {
			break
		}
		if m["type"] != "keyboard" {
			log.Println(m["type"], ": ", m)
		}
		switch m["type"] {
		case "getRoomList":
			u.getRoomList()
		case "createRoom":
			u.createRoom(m)
		case "leaveRoom":
			u.leaveRoom()
		case "enterRoom":
			u.enterRoom(m)
		case "ready":
			u.ready()
		case "unready":
			u.unready()
		case "start":
			u.start()
		case "keyboard":
			u.keyboard(m)
		case "roomMsg":
			u.sendRoomMsg(m, true)
		case "__offer":
			u.sendRoomMsg(m, false)
		case "__answer":
			u.sendRoomMsg(m, false)
		case "__ice_candidate":
			u.sendRoomMsg(m, false)
		default:
			u.broadcast(m)
		}
	}
	u.ws.Close()
}

// server send Msg to client
func (u *User) Writer() {
	for m := range u.msg {
		err := u.ws.WriteJSON(m)
		if err != nil {
			break
		}
	}
	u.ws.Close()
}

func (u *User) Register() {
	u.room = nil
	u.state = "在线"
	if user, ok := h.users[u.name]; ok {
		user.ws.WriteJSON(map[string]interface{}{
			"type": "relogin",
		})
		user.Unregister()
	}
	h.users[u.name] = u
	// log.Println(h.users)
	u.broadcast(map[string]interface{}{
		"type": "in",
		"user": map[string]interface{}{
			"name":   u.name,
			"avatar": u.avatar,
		},
	})
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
		"type": "info",
		// "keyboard": getKeyboard(u.Name),
	}
}

func (u *User) Unregister() {
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
			user.Unregister()
		}
		select {
		case user.msg <- m:
		default:
			log.Println("channel is full !")
			// delete(h.users, user.Name)
			// close(user.Msg)
		}
	}
}
