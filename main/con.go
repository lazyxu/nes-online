package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// client send msg to server
func (u *User) reader() {
	for {
		m := make(map[string]interface{})
		err := u.ws.ReadJSON(&m)
		if err != nil {
			break
		}
		log.Println("reader: ", m)
		switch m["type"] {
		case "in":
			u.register(m)
		case "createRoom":
			u.createRoom(m)
		case "roomMsg":
			u.sendRoomMsg(m)
		default:
			u.broadcast(m)
		}
	}
	u.ws.Close()
}

// server send msg to client
func (u *User) writer() {
	for m := range u.msg {
		err := u.ws.WriteJSON(m)
		if err != nil {
			break
		}
	}
	u.ws.Close()
}

var upgrader = &websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		println(err)
		return
	}
	u := &User{
		msg: make(chan map[string]interface{}, 256),
		ws:  ws,
	}
	defer func() {
		u.unregister()
	}()
	users := map[string]interface{}{}
	for _, user := range h.users {
		users[user.name] = map[string]interface{}{
			"name":   user.name,
			"avatar": user.avatar,
		}
	}
	u.ws.WriteJSON(map[string]interface{}{
		"type":  "userlist",
		"users": users,
	})
	go u.writer()
	u.reader()
}
