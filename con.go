package main

import (
	"net/http"

	"github.com/MeteorKL/nes-online/router"
	"github.com/MeteorKL/nes-online/model"

	"github.com/gorilla/websocket"
	"log"
)

var upgrader = &websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	s := router.SessionStore.PeekSession(r, router.CookieName)
	if user, ok := s.Get("user").(map[string]interface{}); ok {
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			ws.Close()
			return
		}
		model.UserHandler(ws, user)
	}
}
