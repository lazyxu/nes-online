package main

import (
	"nes-online/koala"
	"net/http"
)

func routerInit() {
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("../react/build/img"))))
	http.Handle("/rom/", http.StripPrefix("/rom/", http.FileServer(http.Dir("../react/build/rom"))))
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("../react/build"))))
	http.Handle("/src/", http.StripPrefix("/src/", http.FileServer(http.Dir("../react/src"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("../react/build/js"))))

	koala.RenderPath = "../react/build/"
	koala.Get("/", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		user := koala.GetSessionValue(r, cookieName, "user")
		koala.Render(w, "index.html", map[string]interface{}{
			"initialState": map[string]interface{}{
				"user": user,
			},
		})
	})
	// koala.Get("/register", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "index.html", "null")
	// })
	// koala.Get("/login", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "index.html", "null")
	// })
	// koala.Get("/forgetPassword", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "index.html", "null")
	// })
	// koala.Get("/forgetPassword/reset", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "index.html", "null")
	// })
	// koala.Get("/register", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "index.html", "null")
	// })
	// koala.Get("/backstage", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	// 	koala.Render(w, "backstage.html", nil)
	// })
	api()
	http.HandleFunc("/ws", wsHandler)
}
