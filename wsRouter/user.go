package wsRouter

import (
	"github.com/gorilla/websocket"
	"github.com/MeteorKL/koala/logger"
	"io/ioutil"
	"strconv"
	"encoding/json"
)

type User struct {
	Typ         int    `json:"type"`
	Name        string `json:"name"`
	Avatar      string `json:"avatar"`
	room        *Room
	ws          *websocket.Conn
	msg         chan map[string]interface{}
	State       string `json:"state"`
	StateInRoom int    `json:"state_in_room"`
	IdInRoom    int    `json:"id_in_room"`
}

func UserHandler(ws *websocket.Conn, user map[string]interface{}) {
	u := &User{
		Typ:      user["type"].(int),
		Name:     user["name"].(string),
		Avatar:   user["avatar"].(string),
		room:     nil,
		ws:       ws,
		msg:      make(chan map[string]interface{}, 256),
		State:    "在线",
		IdInRoom: -1,
	}
	if _, ok := addUser(u); !ok {
		u.msg <- map[string]interface{}{
			"type": "relogin",
		}
	}
	defer func() {
		if u != nil {
			u.out()
		}
	}()
	// server send Msg to client
	go func(u *User) {
		for m := range u.msg {
			if m["type"] != "operation" {
				logger.Debug(m["type"])
				logger.Debug(m)
			}
			err := u.ws.WriteJSON(m)
			if err != nil {
				break
			}
		}
		u.ws.Close()
	}(u)
	u.Reader()
}

// client send Msg to server
func (u *User) Reader() {
	for {
		if !checkUser(u) {
			continue
		}
		m := make(map[string]interface{})
		err := u.ws.ReadJSON(&m)
		if err != nil {
			break
		}
		if m["type"] != "operation" {
			logger.Debug(m["type"])
			logger.Debug(m)
		}
		switch m["type"] {
		case "getRoomList":
			u.msg <- map[string]interface{}{
				"type":     "roomList",
				"roomList": h.rooms,
			}
		case "createRoom":
			u.createRoom(m)
		case "leaveRoom":
			u.leaveRoom()
		case "enterRoom":
			u.enterRoom(m)
		case "ready":
			u.ready()
		case "unready":
			u.unready()
		case "start":
			u.start()
		case "save":
			b, err := json.Marshal(u.room.operation)
			logger.Error(err)
			ioutil.WriteFile(u.Name+": "+strconv.Itoa(u.room.ID)+"-"+u.room.Game+".json", b, 0666)
		case "endGame":
			//b, err := json.Marshal(u.room.operation)
			//logger.Error(err)
			//ioutil.WriteFile(strconv.Itoa(u.room.ID)+"-"+u.room.Game+".json", b, 0666)
			u.endGame()
		case "operation":
			//id :=int64(m["id"].(float64))
			//u.room.operation[id] = append(u.room.operation[id], int64( m["operation"].(float64)))
			u.sendRoomMsg(m, u.Name, false)
		case "roomMsg":
			u.sendRoomMsg(m, u.Name, true)
		case "__offer":
			u.sendRoomMsg(m, u.Name, false)
		case "__answer":
			u.sendRoomMsg(m, u.Name, false)
		case "__ice_candidate":
			u.sendRoomMsg(m, u.Name, false)
		default:
			u.broadcast(m)
		}
	}
	u.ws.Close()
}

func (u *User) out() {
	u.leaveRoom()
	delUser(u)
	close(u.msg)
}

func (u *User) broadcast(m map[string]interface{}) {
	m["from"] = u.Name
	h.userMutex.RLock()
	defer h.userMutex.RUnlock()
	for _, users := range h.users {
		for _, user := range users {
			if user.msg == nil {
				logger.Info("channel is nil")
				user.out()
			}
			select {
			case user.msg <- m:
			default:
				logger.Warn("channel is full !")
			}
		}
	}
}
