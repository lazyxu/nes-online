package router

import (
	"net/http"

	"github.com/MeteorKL/koala"
)

func Init() {
	http.Handle("/img/", http.FileServer(http.Dir("static")))
	http.Handle("/roms/", http.FileServer(http.Dir("static")))
	// http.Handle("/static/", http.FileServer(http.Dir("static")))
	// http.Handle("/src/", http.StripPrefix("/src/", http.FileServer(http.Dir("../react/src"))))
	http.Handle("/js/", http.FileServer(http.Dir("static")))

	koala.RenderPath = "static/"
	koala.Get("/", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		user := koala.GetSessionValue(r, CookieName, "user")
		koala.Render(w, "index.html", map[string]interface{}{
			"initialState": map[string]interface{}{
				"user": user,
			},
		})
	})
	api()
}
