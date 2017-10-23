package router

import (
	"github.com/MeteorKL/koala"
)

const CookieName = "SessionID"

func writeErrJSON(c *koala.Context, msg string) {
	c.WriteJSON(map[string]interface{}{
		"error": true,
		"msg":   msg,
	})
}

func writeSuccessJSON(c *koala.Context, msg string, data interface{}) {
	c.WriteJSON(map[string]interface{}{
		"error": false,
		"msg":   msg,
		"data":  data,
	})
}

func api() {
	apiGame()
	apiRom()
	apiRegister()
	apiActive()
	apiLogin()
	apiForgetPassword()
	apiKeyboard()
}
