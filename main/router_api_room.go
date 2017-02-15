package main

import (
	"nes-online/koala"
	"net/http"
	"strconv"
)

func listRoom(k *koala.Params, w http.ResponseWriter, r *http.Request) {

	room := map[string]interface{}{}
	for _, r := range h.rooms {
		count := 0
		for _, u := range r.players {
			if u != nil {
				count++
			}
		}
		room[strconv.Itoa(r.id)] = map[string]interface{}{
			"id":     r.id,
			"game":   r.game,
			"number": strconv.Itoa(count) + "/" + strconv.Itoa(len(r.players)),
			"name":   r.name,
		}
	}
	koala.WriteJSON(w, room)
}

func apiRoom() {
	koala.Get("/api/listRoom", listRoom)
}
