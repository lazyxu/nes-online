package wsRouter

import (
	"github.com/gorilla/websocket"
	"github.com/MeteorKL/koala/logger"
)

type User struct {
	typ      int
	name     string
	avatar   string
	room     *Room
	ws       *websocket.Conn
	msg      chan map[string]interface{}
	state    string
	idInRoom int
}

func UserHandler(ws *websocket.Conn, user map[string]interface{}) {
	u := &User{
		typ:      user["type"].(int),
		name:     user["name"].(string),
		avatar:   user["avatar"].(string),
		room:     nil,
		ws:       ws,
		msg:      make(chan map[string]interface{}, 256),
		state:    "在线",
		idInRoom: -1,
	}
	u.in()
	defer func() {
		u.out()
		close(u.msg)
	}()
	// server send Msg to client
	go func(u *User) {
		for m := range u.msg {
			logger.Debug(m)
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
		m := make(map[string]interface{})
		err := u.ws.ReadJSON(&m)
		if err != nil {
			break
		}
		if m["type"] != "keyboard" {
			logger.Debug(m["type"])
			logger.Debug(m)
		}
		switch m["type"] {
		case "getRoomList":
			u.msg <- map[string]interface{}{
				"type":     "roomList",
				"roomList": roomlist(),
			}
		case "createRoom":
			if game, ok := m["game"].(string); !ok {
				logger.Warn(u.name + ", expect game in createRoom")
			} else {
				createRoom(u, game)
				u.msg <- map[string]interface{}{
					"type": "createRoom",
					"room": roomInfo(u.room),
				}
			}
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
		case "keyboard":
			u.keyboard(m)
		case "roomMsg":
			u.sendRoomMsg(m, u.name, true)
		case "__offer":
			u.sendRoomMsg(m, u.name, false)
		case "__answer":
			u.sendRoomMsg(m, u.name, false)
		case "__ice_candidate":
			u.sendRoomMsg(m, u.name, false)
		default:
			u.broadcast(m)
		}
	}
	u.ws.Close()
}

func (u *User) in() {
	if user, ok :=addUser(u);!ok {
		user.msg <- map[string]interface{}{
			"type": "relogin",
		}
	}
}

func (u *User) out() {
	u.leaveRoom()
	delUser(u)
}

func (u *User) broadcast(m map[string]interface{}) {
	m["from"] = u.name
	h.userMutex.RLock()
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
				// delete(h.users, user.Name)
				// close(user.Msg)
			}
		}
	}
	h.userMutex.Unlock()
}
