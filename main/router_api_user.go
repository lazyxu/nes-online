package main

import (
	"nes-online/koala"
	"net/http"
)

func listUser(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	users := map[string]interface{}{}
	for _, user := range h.users {
		users[user.name] = map[string]interface{}{
			"name":   user.name,
			"avatar": user.avatar,
		}
	}
	koala.WriteJSON(w, users)
}
