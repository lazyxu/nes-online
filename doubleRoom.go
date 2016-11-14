package main

import (
	"log"
	"strconv"
	"sync"
)

// DoubleRoom -
type DoubleRoom struct {
	ID           int
	Name         string
	GameName     string
	Players      map[int]*Connection
	PlayerNum    int
	PlayerMaxNum int
	Ready        map[int]bool
	// 0: null
	// 1: created
	// 2: startP2P
	// 3: __offer
	// 4: __answer
	State int
	// Mutex
	rwmutex sync.RWMutex
}

// createDoubleRoom - "Handle": "createDoubleRoom", "GameName": GameName
func (c *Connection) createDoubleRoom(m map[string]interface{}) {
	if c.RoomID != 0 {
		c.leaveDoubleRoom(map[string]interface{}{
			"Handle": "leaveDoubleRoom",
			"IP":     c.IP,
			"Name":   c.UserName,
		})
	}
	r := &DoubleRoom{
		Players: make(map[int]*Connection),
		Ready:   make(map[int]bool),
	}
	h.DoubleRoomNum++
	h.DoubleRoom[h.DoubleRoomNum] = r
	r.ID = h.DoubleRoomNum
	r.Name = "双人房" + strconv.Itoa(r.ID)
	r.Players[1] = c
	r.PlayerNum = 1
	r.PlayerMaxNum = 2
	r.GameName = m["GameName"].(string)
	for _, conn := range r.Players {
		r.Ready[conn.RoomID] = false
	}
	log.Println("DoubleRoom.init")
	log.Println("233")
	c.RoomID = r.ID
	c.RoomPlayerNO = 1
	m["RoomID"] = r.ID
	m["RoomName"] = r.Name
	m["GameName"] = r.GameName
	m["PlayerNum"] = r.PlayerNum
	m["PlayerMaxNum"] = r.PlayerMaxNum
	c.broadcast(m)
	log.Println("createDoubleRoom" + strconv.Itoa(m["PlayerNum"].(int)) + "/" + strconv.Itoa(m["PlayerMaxNum"].(int)))
}

// broadcast -
func (d *DoubleRoom) broadcast(m map[string]interface{}) {
	for _, conn := range d.Players {
		select {
		case conn.Msg <- m:
		default:
			delete(d.Players, conn.RoomPlayerNO)
			close(conn.Msg)
		}
	}
	log.Println("DoubleRoom broadcast")
}

// leaveDoubleRoom - "Handle": "leaveDoubleRoom"
func (c *Connection) leaveDoubleRoom(m map[string]interface{}) {
	r := h.DoubleRoom[c.RoomID]
	r.Ready[c.RoomID] = false
	r.PlayerNum--
	m["RoomPlayerNO"] = c.RoomPlayerNO
	m["RoomID"] = c.RoomID
	m["PlayerNum"] = r.PlayerNum
	m["PlayerMaxNum"] = r.PlayerMaxNum
	if c.RoomPlayerNO == 1 {
		for _, conn := range r.Players {
			conn.RoomID = 0
			conn.RoomPlayerNO = 0
		}
		m["Empty"] = true
		delete(h.DoubleRoom, c.RoomID)
	} else {
		delete(r.Players, c.RoomPlayerNO)
		c.RoomID = 0
		c.RoomPlayerNO = 0
		if r.PlayerNum == 0 {
			m["Empty"] = true
		}
	}
	c.broadcast(m)
}

// joinDoubleRoom - "Handle": "joinDoubleRoom", "RoomID": RoomID
func (c *Connection) joinDoubleRoom(m map[string]interface{}) {
	roomID := int(m["RoomID"].(float64))
	if r, ok := h.DoubleRoom[roomID]; ok {
		if c.RoomID == r.ID {
			m["Handle"] = "joinDoubleRoomFailed"
			m["ErrMsg"] = "你已经在该房间"
			m["RoomID"] = r.ID
			c.ws.WriteJSON(m)
		} else if r.PlayerNum == r.PlayerMaxNum {
			m["Handle"] = "joinDoubleRoomFailed"
			m["ErrMsg"] = "该房间人满了"
			m["RoomID"] = r.ID
			c.ws.WriteJSON(m)
		} else if r.PlayerNum < r.PlayerMaxNum {
			if c.RoomID != 0 {
				c.leaveDoubleRoom(map[string]interface{}{
					"Handle": "leaveDoubleRoom",
					"IP":     c.IP,
					"Name":   c.UserName,
				})
			}
			r.PlayerNum++
			r.Players[r.PlayerNum] = c
			c.RoomID = r.ID
			c.RoomPlayerNO = r.PlayerNum
			m["PlayerNum"] = r.PlayerNum
			m["PlayerMaxNum"] = r.PlayerMaxNum
			m["GameName"] = r.GameName
			m["RoomID"] = c.RoomID
			c.broadcast(m)
		} else {
			log.Println("error! " + strconv.Itoa(r.PlayerNum) + "/" + strconv.Itoa(r.PlayerMaxNum))
		}
	} else {
		m["Handle"] = "joinDoubleRoomFailed"
		m["ErrMsg"] = "该房间不存在"
		c.ws.WriteJSON(m)
	}
	log.Println("joinDoubleRoom")
}

// readyDoubleRoom - "Handle": "readyDoubleRoom"
func (c *Connection) readyDoubleRoom(m map[string]interface{}) {
	r := h.DoubleRoom[c.RoomID]
	m["RoomPlayerNO"] = c.RoomPlayerNO
	m["RoomID"] = c.RoomID
	r.Ready[c.RoomPlayerNO] = true
	r.broadcast(m)
	log.Println(r.Players)
	for i := 1; i <= r.PlayerMaxNum; i++ {
		if !r.Ready[i] {
			log.Println(i)
			log.Println("还没准备好")
			return
		}
	}
	msg := make(map[string]interface{})
	msg["Handle"] = "startDoubleRoom"
	m["RoomID"] = c.RoomID
	r.broadcast(msg)
}

func (c *Connection) p2pIceCandidate(m map[string]interface{}) {
	r := h.DoubleRoom[c.RoomID]
	if m["candidate"] == nil {
		return
	}
	if c.RoomPlayerNO == 1 {
		r.Players[2].Msg <- m
	} else if c.RoomPlayerNO == 2 {
		r.Players[1].Msg <- m
	}
}

func (c *Connection) p2pOffer(m map[string]interface{}) {
	r := h.DoubleRoom[c.RoomID]
	r.Players[2].Msg <- m
}

func (c *Connection) p2pAnswer(m map[string]interface{}) {
	r := h.DoubleRoom[c.RoomID]
	r.Players[1].Msg <- m
}
