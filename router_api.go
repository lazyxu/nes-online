package main

import "github.com/MeteorKL/koala"

const cookieName = "sessionID"

func api() {
	koala.Get("/api/getGameList", getGameList)

	apiUser()
	apiRegister()
	apiActive()
	apiLogin()
	apiForgetPassword()
	apiKeyboard()
}
