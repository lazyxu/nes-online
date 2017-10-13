package main

import (
	"net/http"

	"github.com/MeteorKL/koala"
	"github.com/MeteorKL/nes-online/router"
	"github.com/MeteorKL/nes-online/wsRouter"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/config"
)

func main() {
	logger.SetLogLevel(config.Conf.LogLevel)
	router.Init()

	http.HandleFunc("/ws", wsHandler)
	wsRouter.NewHub()

	// http
	koala.Run("8081")
}
