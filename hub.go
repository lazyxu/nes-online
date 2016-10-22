package main

import "log"

type hub struct {
	// all connections
	connections map[*connection]bool

	// msg from connection
	msg chan map[string]string

	// register from connection
	register chan *connection

	// unregister from connection
	unregister chan *connection

	// pair mode
	pair1          map[string]*connection
	pair2          map[string]*connection
	pairReady      map[string]bool
	pairStart      map[string]bool
	maxPingPair    map[string]int64
	buttonSetPair1 map[string]string
	buttonSetPair2 map[string]string
	gamePathPair   map[string]string
	// msgPair from connection
	msgPair chan map[string]string
	// pair number
	numPair int

	// connection number
	num int32
	// connections
	names []string
}

var h = hub{
	connections: make(map[*connection]bool),
	msg:         make(chan map[string]string),
	register:    make(chan *connection),
	unregister:  make(chan *connection),

	pair1:          make(map[string]*connection),
	pair2:          make(map[string]*connection),
	pairReady:      make(map[string]bool),
	pairStart:      make(map[string]bool),
	maxPingPair:    make(map[string]int64),
	buttonSetPair1: make(map[string]string),
	buttonSetPair2: make(map[string]string),
	gamePathPair:   make(map[string]string),
	msgPair:        make(chan map[string]string),
}

func (h *hub) run() {
	h.numPair = 0
	h.num = 0
	for {
		select {
		case c := <-h.register:
			h.connections[c] = true
		case c := <-h.unregister:
			if _, ok := h.connections[c]; ok {
				delete(h.connections, c)
				close(c.send)
			}
		case m := <-h.msg:
			log.Println(m["opt"] + " " + m["ip"] + " " + m["data"] + " " + m["roomName"])
			for c := range h.connections {
				select {
				case c.send <- m:
				default:
					delete(h.connections, c)
					close(c.send)
				}
			}
			log.Println("send msg success")
		case m := <-h.msgPair:
			log.Println(m["opt"] + " " + m["ip"] + " " + m["data"] + " " + m["roomName"] + " " + m["empty"] + m["time"])
			if _, ok := m["roomName"]; ok {
				pair1 := h.pair1[m["roomName"]]
				pair2 := h.pair2[m["roomName"]]
				log.Println(pair1)
				log.Println(pair2)
				if _, okto := m["to"]; okto {
					if m["to"] == "1" {
						if _, ok1 := h.pair1[m["roomName"]]; ok1 {
							select {
							case pair1.send <- m:
								log.Println(m["opt"] + " from:" + m["from"] + " to:" + m["to"])
							default:
								delete(h.pair1, pair1.roomName)
								close(pair1.send)
							}
						}
					} else if m["to"] == "2" {
						if _, ok2 := h.pair2[m["roomName"]]; ok2 {
							select {
							case pair2.send <- m:
								log.Println(m["opt"] + " from:" + m["from"] + " to:" + m["to"])
							default:
								delete(h.pair2, pair2.roomName)
								close(pair2.send)
							}
						}
					}
				} else {
					if _, ok1 := h.pair1[m["roomName"]]; ok1 {
						select {
						case pair1.send <- m:
							log.Println(m["opt"] + " from:" + m["from"] + " to:" + m["to"])
						default:
							delete(h.pair1, pair1.roomName)
							close(pair1.send)
						}
					}
					if _, ok2 := h.pair2[m["roomName"]]; ok2 {
						select {
						case pair2.send <- m:
							log.Println(m["opt"] + " from:" + m["from"] + " to:" + m["to"])
						default:
							delete(h.pair2, pair2.roomName)
							close(pair2.send)
						}
					}
				}
				log.Println("send msgPair success")
			}
		}
	}
}
