package router

import (
	"net/http"

	"github.com/MeteorKL/koala"
	"io/ioutil"
	"encoding/json"
	"log"
)

func Init() {

	if bytes, err := ioutil.ReadFile("config.json"); err == nil {
		if err := json.Unmarshal(bytes, &config); err != nil {
			log.Println("error in json.Unmarshal, ", err.Error())
		}
	} else {
		log.Println("error in ioutil.ReadFile, ", err.Error())
	}

	http.Handle("/img/", http.FileServer(http.Dir("static")))
	http.Handle("/roms/", http.FileServer(http.Dir("static")))
	// http.Handle("/static/", http.FileServer(http.Dir("static")))
	// http.Handle("/src/", http.StripPrefix("/src/", http.FileServer(http.Dir("../react/src"))))
	http.Handle("/js/", http.FileServer(http.Dir("static")))

	koala.RenderPath = "static/"
	koala.Get("/", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		koala.Render(w, "index.html", nil)
	})
	api()
}
