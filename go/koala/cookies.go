package koala

import "net/http"
import "log"

func SetError(w http.ResponseWriter, err string) {
	http.SetCookie(w, &http.Cookie{
		Name:  "err",
		Value: base64coder.EncodeToString([]byte(err)),
		Path:  "",
	})
}

func GetError(w http.ResponseWriter, r *http.Request) string {
	log.Println(r.Cookies)
	c, err := r.Cookie("err")
	if err != nil {
		println(err)
		return ""
	}
	cc, err := base64coder.DecodeString(c.Value)
	if err != nil {
		println(err)
		return ""
	}
	str := string(cc)
	if str != "" {
		removeCookie(w, c)
	}
	return str
}

func SetSuccess(w http.ResponseWriter, success string) {
	c := &http.Cookie{
		Name:  "success",
		Value: base64coder.EncodeToString([]byte(success)),
		Path:  "",
	}
	http.SetCookie(w, c)
	log.Println("success path: " + c.Path)
}

func GetSuccess(w http.ResponseWriter, r *http.Request) string {
	log.Println(r.Cookies)
	c, err := r.Cookie("success")
	if err != nil {
		println(err)
		return ""
	}
	println(c.Value)
	cc, err := base64coder.DecodeString(c.Value)
	println(string(cc))
	if err != nil {
		println(err)
		return ""
	}
	str := string(cc)
	if str != "" {
		removeCookie(w, c)
	}
	return str
}

func removeCookie(w http.ResponseWriter, c *http.Cookie) {
	c.MaxAge = 0
	http.SetCookie(w, c)
}
