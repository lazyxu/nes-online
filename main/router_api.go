package main

import "github.com/MeteorKL/koala"

const cookieName = "sessionID"

func api() {
	koala.Get("/api/listGame", listGame)

	apiUser()
	apiRegister()
	apiActive()
	apiLogin()
	apiForgetPassword()
	apiKeyboard()
}
