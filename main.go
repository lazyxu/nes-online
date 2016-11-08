// gohttps/2-https/server.go
package main

import (
	"crypto/md5"
	"fmt"
	"go/build"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

func alone(w http.ResponseWriter, r *http.Request) {
	println(r.URL)
	args := map[string]string{"Host1": r.Host, "Host2": r.Host}
	renderHTML(w, "alone.html", args)
}

func p2p(w http.ResponseWriter, r *http.Request) {
	println(r.URL)
	args := map[string]string{"Host1": r.Host, "Host2": r.Host}
	renderHTML(w, "p2p.html", args)
}

func cs(w http.ResponseWriter, r *http.Request) {
	println(r.URL)
	args := map[string]string{"Host1": r.Host, "Host2": r.Host}
	renderHTML(w, "cs.html", args)
}

func defaultAssetPath() string {
	p, err := build.Default.Import("gary.burd.info/go-websocket-chat", "", build.FindOnly)
	if err != nil {
		return "."
	}
	return p.Dir
}

func updateRomlistInHTML(src string, des string) {
	data, _ := ioutil.ReadFile(src)
	newData := strings.Replace(string(data), "{{.Romlist}}", romlist, -1)
	dstFile, err := os.Create(des)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer dstFile.Close()
	dstFile.WriteString(newData)
}

// ListDir xxx
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
	http.Handle("/template/", http.StripPrefix("/template/", http.FileServer(http.Dir("template"))))

	fmt.Println("getRomList")
	ListDir("roms/", ".nes")
	fmt.Println("updateRomlistInHTML")
	updateRomlistInHTML("template/cs.html", "views/cs.html")
	updateRomlistInHTML("template/p2p.html", "views/p2p.html")
	updateRomlistInHTML("template/alone.html", "views/alone.html")
	updateRomlistInHTML("template/index.html", "views/index.html")

	fmt.Println("start")

	// go h.run()

	// 路由设置
	http.HandleFunc("/", index)
	http.HandleFunc("/alone", alone)
	http.HandleFunc("/cs", cs)
	http.HandleFunc("/p2p", p2p)
	http.HandleFunc("/ws", wsHandler)
	// http.HandleFunc("/update", update)

	// http
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
	// if err := http.ListenAndServeTLS(":8080", "server.pem", "server.key", nil); err != nil {
	// 	log.Fatal("ListenAndServe:", err)
	// }
}
