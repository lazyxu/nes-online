package koala

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path"
	"strings"
)

// 路由定义
type Route struct {
	slice   []string
	method  string
	handler func(p *Params, w http.ResponseWriter, r *http.Request)
}

type Params struct {
	Param     map[string][]string
	ParamGet  map[string][]string
	ParamPost map[string][]string
	ParamUrl  map[string]string
}

type App struct {
	routes        []Route
	listeningPort net.Listener
}

var showLog = false

// 使用正则路由转发
func (app *App) route(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	p := Params{
		ParamGet:  r.URL.Query(),
		ParamPost: r.PostForm,
		Param:     r.Form,
		ParamUrl:  make(map[string]string),
	}

	requestPath := r.URL.Path
	r.ParseForm()
	if showLog {
		log.Println(r.Method + " " + requestPath)
	}
	isFound := false
	for i := 0; i < len(app.routes); i++ {
		route := app.routes[i]
		if route.method == "Handle" || route.method == r.Method {
			url := strings.Split(requestPath, "/")[1:]
			if len(url) != len(route.slice) {
				continue
			}
			if len(route.slice[0]) == 0 {
				if len(url[0]) != 0 {
					continue
				}
			} else {
				matched := true
				for i := 0; i < len(route.slice); i++ {
					if route.slice[i][0] == ':' {
						p.ParamUrl[route.slice[i][1:]] = url[i]
					} else if route.slice[i] == url[i] {
						continue
					} else {
						matched = false
						break
					}
				}
				if !matched {
					continue
				}
			}

			if showLog {
				log.Println(route.slice)
				fmt.Print("get: ")
				fmt.Println(p.ParamGet)
				fmt.Print("post: ")
				fmt.Println(p.ParamPost)
				fmt.Print("url: ")
				fmt.Println(p.ParamUrl)
			}
			isFound = true
			route.handler(&p, w, r)
			break

		}
	}

	if !isFound {
		NotFound(w)
	}
}

// 方便测试
func Handle(pattern string, handler interface{}) {
	app.addRoute(pattern, "Handle", handler)
}

// 查看文章
func Get(pattern string, handler interface{}) {
	app.addRoute(pattern, "GET", handler)
}

// 发布文章
func Post(pattern string, handler interface{}) {
	app.addRoute(pattern, "POST", handler)
}

// 删除文章
func Delete(pattern string, handler interface{}) {
	app.addRoute(pattern, "DELETE", handler)
}

// 更新文章
func Put(pattern string, handler interface{}) {
	app.addRoute(pattern, "PUT", handler)
}

func (app *App) addRoute(pattern string, method string, handler interface{}) {
	slice := strings.Split(pattern, "/")
	app.routes = append(app.routes, Route{slice: slice[1:], method: method, handler: handler.(func(p *Params, w http.ResponseWriter, r *http.Request))})
}

func NotFound(w http.ResponseWriter) {
	w.WriteHeader(404)
	w.Write([]byte("404 Page Not Found!"))
}

var app = App{}

func Run(addr string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		app.route(w, r)
	})
	log.Println("Listening on port " + addr)
	if err := http.ListenAndServe(":"+addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

func RunWithLog(addr string) {
	showLog = true
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		app.route(w, r)
	})
	log.Println("Listening on " + addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

var VaildSuffix = []string{
	".doc", ".docx",
	".ppt", ".pptx",
	".xls", ".xlsx",
	".txt", ".pdf",
}

func SavePostFile(r *http.Request, key string, dir string) (string, string, string, error) {
	file, handle, err := r.FormFile(key)
	if err != nil {
		return "", "", "", err
	}
	filename := handle.Filename
	suffix := path.Ext(filename)
	flag := false
	for _, s := range VaildSuffix {
		if suffix == s {
			flag = true
		}
	}
	if !flag {
		return "", "", "", errors.New("不支持的文件后缀名")
	}
	attachPath := dir + filename
	filepath := "./static/upload" + dir + filename
	os.MkdirAll(path.Dir(filepath), 0777)
	f, err := os.OpenFile(filepath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Println(err)
		return "", "", "", err
	}
	_, err = io.Copy(f, file)
	if err != nil {
		log.Println(err)
		return "", "", "", err
	}
	defer f.Close()
	defer file.Close()
	return attachPath, filename, suffix, nil
}
