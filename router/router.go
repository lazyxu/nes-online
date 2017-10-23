package router

import (
	"net/http"

	"github.com/MeteorKL/koala"
)

var app *koala.App

func Init(a *koala.App) {
	app = a
	http.Handle("/img/", http.FileServer(http.Dir("static")))
	http.Handle("/roms/", http.FileServer(http.Dir("static")))
	// http.Handle("/static/", http.FileServer(http.Dir("static")))
	// http.Handle("/src/", http.StripPrefix("/src/", http.FileServer(http.Dir("../react/src"))))
	http.Handle("/js/", http.FileServer(http.Dir("static")))

	app.SetRenderPath("static/")
	app.Get("/", func(c *koala.Context) {
		c.Render("index.html", nil)
	})
	api()
}
