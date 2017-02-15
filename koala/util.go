package koala

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var base64coder = base64.StdEncoding

func HashString(s string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(s)))
}

var RenderPath string

func Render(w http.ResponseWriter, file string, data interface{}) {
	t, err := template.New(file).ParseFiles(RenderPath + file)
	if err != nil {
		log.Println(err)
	}
	t.Execute(w, data)
}

func Relocation(w http.ResponseWriter, URL string) {
	// w.Header().Set("Location", URL)
	t, err := template.New("x").Parse("<script>window.location.href='" + URL + "';</script>")
	if err != nil {
		log.Println(err)
	}
	t.Execute(w, nil)
}

func Back(w http.ResponseWriter) {
	t, err := template.New("x").Parse("<script>history.go(-1);</script>")
	if err != nil {
		log.Println(err)
	}
	t.Execute(w, nil)
}

func WriteJSON(w http.ResponseWriter, data interface{}) {
	json, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	}
	w.Write(json)
}
