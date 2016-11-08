package main

import "log"

type hub struct {
	// all connections
	connections map[*connection]bool

	// msg from connection
	msg chan map[string]interface{}

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
	buttonSetPair1 map[string]interface{}
	buttonSetPair2 map[string]interface{}
	gamePathPair   map[string]string
	// msgPair from connection
	msgPair chan map[string]interface{}
	// pair number
	numPair int

	// connection number
	num int32
	// connections
	names []string
}

var h = hub{
	connections: make(map[*connection]bool),
	msg:         make(chan map[string]interface{}),
	register:    make(chan *connection),
	unregister:  make(chan *connection),

	pair1:          make(map[string]*connection),
	pair2:          make(map[string]*connection),
	pairReady:      make(map[string]bool),
	pairStart:      make(map[string]bool),
	maxPingPair:    make(map[string]int64),
	buttonSetPair1: make(map[string]interface{}),
	buttonSetPair2: make(map[string]interface{}),
	gamePathPair:   make(map[string]string),
	msgPair:        make(chan map[string]interface{}),
}

func (c *connection) register() {
	h.connections[c] = true
}

func (c *connection) unregister() {
	if _, ok := h.connections[c]; ok {
		if c.roomName != "" {
			c.leavePair("")
		}
		delete(h.connections, c)
		close(c.send)
	}
}

func (c *connection) broadcast(m map[string]interface{}) {
	for conn := range h.connections {
		select {
		case conn.send <- m:
		default:
			delete(h.connections, c)
			close(c.send)
		}
	}
	log.Println("send msg success")
}
