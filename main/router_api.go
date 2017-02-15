package main

import "nes-online/koala"

const cookieName = "sessionID"

func api() {
	koala.Get("/api/listUser", listUser)
	koala.Get("/api/listGame", listGame)

	apiRegister()
	apiActive()
	apiLogin()
	apiForgetPassword()

	apiRoom()
}
