package router

import (
	"net/http"

	"github.com/MeteorKL/koala"
)

const CookieName = "NESOnline"

func writeErrJSON(w http.ResponseWriter, msg string) {
	koala.WriteJSON(w, map[string]interface{}{
		"error": true,
		"msg":   msg,
	})
}

func writeSuccessJSON(w http.ResponseWriter, msg string, data interface{}) {
	koala.WriteJSON(w, map[string]interface{}{
		"error": false,
		"msg":   msg,
		"data":  data,
	})
}

func api() {
	koala.Get("/api/getGameList", getGameList)

	apiUser()
	apiRegister()
	apiActive()
	apiLogin()
	apiForgetPassword()
	apiKeyboard()
}
