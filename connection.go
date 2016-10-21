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
	// 发送信息的缓冲 channel
	send chan map[string]string
}

// 客户端到服务器
func (c *connection) reader(ip string) {
	message := make(map[string]string)
	for {
		err := c.ws.ReadJSON(&message)
		if err != nil {
			println("ReadJSON err")
			println(err)
			break
		}
		message["ip"] = ip
		switch message["opt"] {
		case "msg":
			h.msg <- message
		case "createPair":
			c.createPair(message)
		case "joinPair":
			c.joinPair(message)
		case "readyPair":
			c.readyPair(message)
		case "leavePair":
			c.leavePair("")
		case "keyboard":
			c.keyboard(message)
		default:
			log.Println(message["opt"])
			h.msg <- message
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
	c := &connection{send: make(chan map[string]string, 256), ws: ws}
	h.register <- c

	c.ip = ip
	h.msg <- map[string]string{
		"opt":  "in",
		"data": ip,
	}
	c.ws.WriteJSON(map[string]string{
		"opt":  "ip",
		"data": ip,
	})
	defer func() {
		h.msg <- map[string]string{
			"opt":  "out",
			"data": ip,
		}
		h.unregister <- c
	}()
	go c.writer()
	c.reader(ip)
}
