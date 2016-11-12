package main

import (
	"log"
	"sync"
	"time"

	"math/rand"
)

// Hub -
type Hub struct {
	// Connections
	Connections   map[*Connection]bool
	ConnectionNum int

	// DoubleRooms
	DoubleRoom    map[int]*DoubleRoom
	DoubleRoomNum int
	// Mutex
	rwmutex sync.RWMutex
}

var h = Hub{
	Connections: make(map[*Connection]bool),
	DoubleRoom:  make(map[int]*DoubleRoom),
}

var names = []string{
	"Jaina",
	"MountainKing",
	"Medivh",
	"Blademaster",
	"ShadowHunter",
	"Lich",
	"DreadLord",
	"DarkRanger",
	"Deathkinght",
	"DemonHunter",
	"Illidan",
	"Furion",
	"Tyrande",
	"Maiev",
	"Footman",
}

func (h *Hub) init() {
	h.ConnectionNum = 0
	h.DoubleRoomNum = 0
}

func (c *Connection) register() {
	h.Connections[c] = true
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	c.UserName = names[r.Intn(len(names))]
	c.RoomID = 0
	c.RoomPlayerNO = 0
	h.ConnectionNum++
}

func (c *Connection) unregister() {
	if _, ok := h.Connections[c]; ok {
		if c.RoomID != 0 {
			c.leaveDoubleRoom(map[string]interface{}{
				"Handle": "leaveDoubleRoom",
				"IP":     c.IP,
				"Name":   c.UserName,
			})
		}
		h.ConnectionNum--
		delete(h.Connections, c)
		close(c.Msg)
	}
}

func (c *Connection) broadcast(m map[string]interface{}) {
	for conn := range h.Connections {
		select {
		case conn.Msg <- m:
		default:
			delete(h.Connections, c)
			close(c.Msg)
		}
	}
	log.Println("broadcast")
}
