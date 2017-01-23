package main

import (
	"encoding/json"
	"fmt"
	"nes-online/go/koala"
	"net/http"
)

func GameList(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	stars := map[string]interface{}{
		"0":       1,
		"1":       4,
		"2":       0,
		"3":       2,
		"4":       9,
		"5":       30,
		"average": 25.6,
	}
	comments := map[string]interface{}{
		"time":    "今天",
		"star":    4,
		"content": "很好玩啊",
		"id":      23462531523,
		"name":    "MeteorKL",
		"avatar":  "/img/questionMark.jpg",
	}
	json, err := json.Marshal([]map[string]interface{}{{
		"name":        "魂斗罗1",
		"shortcut":    "/img/shortcut/魂斗罗1.jpg",
		"path":        "/roms/hundouluo.nes",
		"type":        "其它",
		"comments":    comments,
		"stars":       stars,
		"collections": 27,
	}, {
		"name":        "超级玛丽1",
		"shortcut":    "/img/shortcut/超级玛丽1.jpg",
		"path":        "/roms/supermario.nes",
		"type":        "其它",
		"comments":    comments,
		"stars":       stars,
		"collections": 20,
	}, {
		"name":        "三目童子",
		"shortcut":    "/img/shortcut/三目童子.jpg",
		"path":        "/roms/sanmu.nes",
		"type":        "其它",
		"comments":    comments,
		"stars":       stars,
		"collections": 233,
	},
	})
	if err != nil {
		fmt.Println(err)
	}
	w.Write(json)
}

func UserList(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	json, err := json.Marshal(getUserList())
	if err != nil {
		fmt.Println(err)
	}
	w.Write(json)
}

func Login(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	if k.ParamPost["username"][0] == "m" && k.ParamPost["password"][0] == "m" {
		koala.WriteJSON(w, map[string]interface{}{
			"login": true,
		})
		return
	}
	koala.WriteJSON(w, map[string]interface{}{
		"login": false,
	})
}

func api() {
	koala.Get("/api/GameList", GameList)
	koala.Get("/api/UserList", UserList)
	koala.Post("/api/Login", Login)
}
