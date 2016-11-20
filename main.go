package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

var localRomlist string
var networkRomlist string
var gamePathList string
var version = "NES Online v1.5.2"

func updateRomlistInHTML(src string, des string, opt string) {
	data, _ := ioutil.ReadFile(src)
	var newData string
	if opt == "local" {
		newData = strings.Replace(string(data), "{{.localRomlist}}", localRomlist, -1)
	} else if opt == "network" {
		newData = strings.Replace(string(data), "{{.networkRomlist}}", networkRomlist, -1)
	} else if opt == "both" {
		newData = strings.Replace(string(data), "{{.localRomlist}}", localRomlist, -1)
		newData = strings.Replace(newData, "{{.networkRomlist}}", networkRomlist, -1)
		// check vaild
		newData = strings.Replace(newData, "{{.gamePathList}}", gamePathList, -1)
	} else if opt == "none" {
		newData = string(data)
	}
	destFile, err := os.Create(des)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer destFile.Close()
	destFile.WriteString(newData)
}

func gerRomList(dirPath string, suffix string) {
	dir, err := ioutil.ReadDir(dirPath)
	if err != nil {
		return
	}
	suffix = strings.ToUpper(suffix)
	i := 1
	for _, fi := range dir {
		if fi.IsDir() {
			continue
		}
		if strings.HasSuffix(strings.ToUpper(fi.Name()), suffix) {
			path := dirPath + fi.Name()
			name := strings.Split(fi.Name(), ".nes")[0]
			name = strings.Split(name, ".NES")[0]
			result := strings.Split(name, "类 - ")
			if len(result) > 1 {
				name = result[1]
			}
			networkRomlist += "<button class='rom-button' data-dismiss='modal' aria-hidden='true'  id='rom-" + strconv.Itoa(i) + "' data-dismiss=\"modal\" onclick=\"loadRom('" + path + "', '" + name + "');createDoubleRoom('" + name + "');\">" + name + "</button><br>"
			localRomlist += "<button class='rom-button' data-dismiss='modal' aria-hidden='true'  onclick=\"loadRom('" + path + "', '" + name + "');\">" + name + "</button><br>"
			gamePathList += "<div id='" + strconv.Itoa(i) + "' hidden>" + path + "</div>"
			i++
		}
	}
	fmt.Println(i)
}

func main() {
	localRomlist = ""
	networkRomlist = ""
	gamePathList = ""
	// gerRomList("upload/", ".nes")
	gerRomList("roms/CN/", ".nes")
	gerRomList("roms/", ".nes")

	updateRomlistInHTML("static/template/cs.html", "static/views/cs.html", "network")
	updateRomlistInHTML("static/template/p2p.html", "static/views/p2p.html", "network")
	updateRomlistInHTML("static/template/p2p.new.html", "static/views/p2p.new.html", "both")
	updateRomlistInHTML("static/template/nes.html", "static/views/nes.html", "both")
	updateRomlistInHTML("static/template/alone.html", "static/views/alone.html", "local")

	routerInit()
	fmt.Println("start")

	h.init()

	// http
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
	// if err := http.ListenAndServeTLS(":8080", "server.pem", "server.key", nil); err != nil {
	// 	log.Fatal("ListenAndServe:", err)
	// }
}
