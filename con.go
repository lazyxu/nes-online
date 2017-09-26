package main

import (
	"log"
	"net/http"

	"github.com/MeteorKL/koala"
	"github.com/MeteorKL/nes-online/router"

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
		if m["type"] != "keyboard" {
			log.Println(m["type"], ": ", m)
		}
		switch m["type"] {
		// case "in":
		// 	u.register(m)
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
	data := koala.GetSessionValue(r, router.CookieName, "user")
	koala.DestorySession(r, w, router.CookieName)
	if user, ok := data.(map[string]interface{}); ok {
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			println(err)
			return
		}
		u := &User{
			msg:    make(chan map[string]interface{}, 256),
			ws:     ws,
			name:   user["name"].(string),
			avatar: user["avatar"].(string),
		}
		u.register()
		defer func() {
			u.unregister()
			close(u.msg)
		}()
		go u.writer()
		u.reader()
	}
}
