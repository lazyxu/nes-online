package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type connection struct {
	// websocket 连接器
	ws       *websocket.Conn
	roomName string
	ip       string
	no       string
	ping     int64
	// 发送信息的缓冲 channel
	send chan map[string]interface{}
}

// 客户端到服务器
func (c *connection) reader(ip string) {
	for {
		message := make(map[string]interface{})
		err := c.ws.ReadJSON(&message)
		if err != nil {
			println("ReadJSON err")
			println(err)
			break
		}
		log.Println(message["opt"])
		message["ip"] = ip
		switch message["opt"] {
		case "msg":
			c.broadcast(message)
		case "createPair":
			c.createPair(message)
		case "joinPair":
			c.joinPair(message)
		case "readyPair":
			c.readyPair(message)
		case "leavePair":
			c.leavePair("")
		case "__ice_candidate":
			c.iceCandidate(message)
		case "__offer":
			c.offer(message)
		case "__answer":
			c.answer(message)
		// case "keyboard":
		// 	c.keyboard(message)
		default:
			c.broadcast(message)
		}
	}
	log.Println("reader Close")
	c.ws.Close()
}

// 服务器到客户端
func (c *connection) writer() {
	for message := range c.send {
		err := c.ws.WriteJSON(message)
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
	ip := r.RemoteAddr
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		println(err)
		return
	}
	c := &connection{send: make(chan map[string]interface{}, 256), ws: ws}
	c.register()

	c.ip = ip
	c.broadcast(map[string]interface{}{
		"opt":  "in",
		"data": ip,
	})
	c.ws.WriteJSON(map[string]interface{}{
		"opt":  "ip",
		"data": ip,
	})
	for conn, ok := range h.connections {
		if !ok {
			log.Println(conn)
		}
		log.Println(conn.ip)
		if conn.no == "1" {
			c.ws.WriteJSON(map[string]interface{}{
				"opt":      "listRooms",
				"ip":       conn.ip,
				"roomName": conn.roomName,
				"data":     h.gamePathPair[conn.roomName],
			})
		} else {
			c.ws.WriteJSON(map[string]interface{}{
				"opt":  "listPlayers",
				"data": conn.ip,
			})
		}
	}
	defer func() {
		c.broadcast(map[string]interface{}{
			"opt":  "out",
			"data": ip,
		})
		c.unregister()
	}()
	go c.writer()
	c.reader(ip)
}
