// gohttps/2-https/server.go
package main

import (
	"crypto/md5"
	"flag"
	"fmt"
	"go/build"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var romlist string

func checkErr(err error) {
	if err != nil {
		log.Println(err)
	}
}

func renderHTML(w http.ResponseWriter, file string, data interface{}) {
	// 获取页面内容
	t, err := template.New(file).ParseFiles("views/" + file)
	checkErr(err)
	// 将页面渲染后反馈给客户端
	t.Execute(w, data)
}

func hashFile(path string) (string, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	// "http://www.michaelfogleman.com/static/nes/" + hash + ".png"
	return fmt.Sprintf("%x", md5.Sum(data)), nil
}

func index(w http.ResponseWriter, r *http.Request) {
	println(r.URL)
	args := map[string]string{"Host1": r.Host, "Host2": r.Host}
	renderHTML(w, "index.html", args)
}

func test(w http.ResponseWriter, r *http.Request) {
	renderHTML(w, "test.html", nil)
}

var (
	addr      = flag.String("addr", ":8080", "http service address")
	assets    = flag.String("assets", defaultAssetPath(), "path to assets")
	homeTempl *template.Template
)

func defaultAssetPath() string {
	p, err := build.Default.Import("gary.burd.info/go-websocket-chat", "", build.FindOnly)
	if err != nil {
		return "."
	}
	return p.Dir
}

func chatroom(w http.ResponseWriter, r *http.Request) {
	println("chatroom")
	homeTempl.Execute(w, r.Host)
}

func updateIndexHtml() {
	data, _ := ioutil.ReadFile("views/template.html")
	newData := strings.Replace(string(data), "{{.Romlist}}", romlist, -1)
	fileName := "views/index.html"
	dstFile, err := os.Create(fileName)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer dstFile.Close()
	dstFile.WriteString(newData)
}

func ListDir(dirPth string, suffix string) (files []string, err error) {
	files = make([]string, 0, 10)
	dir, err := ioutil.ReadDir(dirPth)
	if err != nil {
		return nil, err
	}
	suffix = strings.ToUpper(suffix) //忽略后缀匹配的大小写
	i := 1
	romlist = ""
	for _, fi := range dir {
		// fmt.Println(fi.Name())
		if fi.IsDir() { // 忽略目录
			continue
		}
		if strings.HasSuffix(strings.ToUpper(fi.Name()), suffix) { //匹配文件
			Path := dirPth + fi.Name()
			romlist += "<button id='rom-" + strconv.Itoa(i) + "' data-dismiss=\"modal\" onclick=\"loadRom('" + Path + "');createPair('" + Path + "','" + fi.Name() + "');\">" + fi.Name() + "</button>"
			i++
		}
	}
	fmt.Println(i)
	return files, err
}

func main() {
	// 启动静态文件服务
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("css"))))
	http.Handle("/roms/", http.StripPrefix("/roms/", http.FileServer(http.Dir("roms"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))
	http.Handle("/views/", http.StripPrefix("/views/", http.FileServer(http.Dir("views"))))
	fmt.Println("getRomList")
	ListDir("roms/", ".nes")
	// getRomList()
	fmt.Println("updateIndexHtml")
	updateIndexHtml()

	fmt.Println("start")
	flag.Parse()
	homeTempl = template.Must(template.ParseFiles(filepath.Join(*assets, "/views/chatroom.html")))

	go h.run()

	// 路由设置
	http.HandleFunc("/", index)
	http.HandleFunc("/test", test)
	http.HandleFunc("/chatroom", chatroom)
	http.HandleFunc("/ws", wsHandler)
	// http.HandleFunc("/update", update)

	// http
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
	// http.ListenAndServeTLS(":8081", "server.crt", "server.key", nil)
}
