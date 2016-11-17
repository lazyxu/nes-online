package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Connection -
type Connection struct {
	// websocket 连接器
	ws           *websocket.Conn
	RoomID       int
	RoomPlayerNO int
	UserName     string
	IP           string
	Msg          chan map[string]interface{}
	// Mutex
	rwmutex sync.RWMutex
}

// client send ms to server
func (c *Connection) reader(IP string) {
	for {
		m := make(map[string]interface{})
		err := c.ws.ReadJSON(&m)
		if err != nil {
			println("ReadJSON err")
			println(err)
			break
		}
		log.Println(m)
		m["IP"] = c.IP
		m["Name"] = c.UserName
		switch m["Handle"] {
		// case "UploadRom":
		// 	saveRom(m)
		case "InvaildRom":
			deleteRom(m)
		case "Msg":
			m["Msg"] = m["IP"].(string) + " - " + m["Name"].(string) + ": " + m["Msg"].(string)
			c.broadcast(m)
		case "RoomMsg":
			r := h.DoubleRoom[c.RoomID]
			m["Msg"] = m["IP"].(string) + " - " + m["Name"].(string) + ": " + m["Msg"].(string)
			if r != nil {
				r.broadcast(m)
			} else {
				c.ws.WriteJSON(map[string]interface{}{
					"Handle": "RoomMsg",
					"Msg":    "你不在房间中,不能在房间中说悄悄话哦",
				})
			}
		case "Rename":
			c.UserName = m["NewName"].(string)
			c.broadcast(m)
		case "createDoubleRoom":
			c.createDoubleRoom(m)
		case "joinDoubleRoom":
			c.joinDoubleRoom(m)
		case "readyDoubleRoom":
			c.readyDoubleRoom(m)
		case "leaveDoubleRoom":
			c.leaveDoubleRoom(m)
		case "__ice_candidate":
			c.p2pIceCandidate(m)
		case "__offer":
			c.p2pOffer(m)
		case "__answer":
			c.p2pAnswer(m)
		default:
			c.broadcast(m)
		}
	}
	log.Println("reader Close")
	c.ws.Close()
}

// server send ms to client
func (c *Connection) writer() {
	for m := range c.Msg {
		err := c.ws.WriteJSON(m)
		if err != nil {
			println("WriteJSON err")
			println(err)
			break
		}
	}
	log.Println("writer Close")
	c.ws.Close()
}

var upgrader = &websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	IP := r.RemoteAddr
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		println(err)
		return
	}
	c := &Connection{
		Msg: make(chan map[string]interface{}, 256),
		ws:  ws,
	}
	c.register()

	c.IP = IP
	c.broadcast(map[string]interface{}{
		"Handle": "IN",
		"IP":     IP,
		"Name":   c.UserName,
	})
	c.ws.WriteJSON(map[string]interface{}{
		"Handle": "IP",
		"IP":     IP,
		"Name":   c.UserName,
	})
	for conn, ok := range h.Connections {
		if !ok {
			log.Println(conn)
		}
		log.Println(conn.IP)
		if conn.RoomPlayerNO == 1 {
			r := h.DoubleRoom[conn.RoomID]
			c.ws.WriteJSON(map[string]interface{}{
				"Handle":       "listRooms",
				"Name":         conn.UserName,
				"IP":           conn.IP,
				"RoomName":     r.Name,
				"GameName":     r.GameName,
				"RoomID":       r.ID,
				"PlayerNum":    r.PlayerNum,
				"PlayerMaxNum": r.PlayerMaxNum,
			})
		} else {
			c.ws.WriteJSON(map[string]interface{}{
				"Handle": "listPlayers",
				"Name":   conn.UserName,
				"IP":     conn.IP,
			})
		}
	}
	defer func() {
		c.broadcast(map[string]interface{}{
			"Handle": "out",
			"Name":   c.UserName,
			"IP":     IP,
		})
		c.unregister()
	}()
	go c.writer()
	c.reader(IP)
}
