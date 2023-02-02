package main

import (
	"net/http"

	"github.com/MeteorKL/koala"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/router"
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/nes-online/wsRouter"
)

func main() {
	println("main")
	logger.SetLogLevel(config.Conf.LogLevel)
	config.Load()
	app := koala.NewApp()
	router.Init(app)

	// app.Handle()
	http.HandleFunc("/ws", wsHandler)
	wsRouter.NewHub()

	// http
	app.Run("8082")
}
