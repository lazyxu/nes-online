package main

import (
	"log"
	"strconv"
	"time"
)

func (c *connection) createPair(m map[string]interface{}) {
	log.Println(time.Now().Unix())
	log.Println(time.Now().UnixNano())
	c.leavePair("")
	c.roomName = strconv.Itoa(h.numPair)
	log.Println(c.roomName)
	h.gamePathPair[c.roomName], _ = m["url"].(string)
	log.Println(h.gamePathPair[c.roomName])
	h.pair1[c.roomName] = c
	h.pairReady[c.roomName] = false
	h.pairStart[c.roomName] = false
	delete(h.pair2, c.roomName)
	h.numPair++
	log.Println("create success")

	m["opt"] = "createPair"
	m["ip"] = c.ip
	m["roomName"] = c.roomName
	c.no = "1"
	c.broadcast(m)
}

func (c *connection) joinPair(m map[string]interface{}) string {
	msg := ""
	roomName, _ := m["roomName"].(string)
	c.leavePair(roomName)
	c.roomName = roomName
	if _, ok := h.pair1[c.roomName]; ok {
		if c == h.pair1[c.roomName] {
			msg = "already in pair1"
		} else if _, ok := h.pair2[c.roomName]; ok {
			msg = "pair2 exist"
		} else if c == h.pair2[c.roomName] {
			msg = "already in pair2"
		} else {
			m["url"] = h.gamePathPair[c.roomName]
			log.Println(c.roomName)
			log.Println(h.gamePathPair[c.roomName])
			h.pair2[c.roomName] = c
			c.no = "2"
			m["from"] = "2"
			msg = "join success"
			pair1 := h.pair1[c.roomName]
			pair1.send <- m
			pair2 := h.pair2[c.roomName]
			pair2.send <- m
		}
	} else {
		msg = "no sucn a pair"
	}
	log.Println(c.roomName + ":" + msg)
	return msg
}

func (c *connection) readyPair(m map[string]interface{}) {
	m["no"] = c.no
	if pair1, ok := h.pair1[c.roomName]; ok {
		pair1.send <- m
	}
	if pair2, ok := h.pair2[c.roomName]; ok {
		pair2.send <- m
	}
	if c.no == "2" {
		mm := make(map[string]interface{})
		mm["opt"] = "startPair"
		mm["roomName"] = c.roomName
		mm["KEY_UP"] = m["KEY_UP"]
		mm["KEY_DOWN"] = m["KEY_DOWN"]
		mm["KEY_LEFT"] = m["KEY_LEFT"]
		mm["KEY_RIGHT"] = m["KEY_RIGHT"]
		mm["KEY_SELECT"] = m["KEY_SELECT"]
		mm["KEY_START"] = m["KEY_START"]
		mm["KEY_A"] = m["KEY_A"]
		mm["KEY_B"] = m["KEY_B"]
		h.buttonSetPair2 = mm
	}
	if h.pairReady[c.roomName] == false {
		h.pairReady[c.roomName] = true
	} else {
		c.startPair()
	}
}

func (c *connection) startPair() {
	pair1 := h.pair1[c.roomName]
	pair1.send <- h.buttonSetPair2
	m := make(map[string]interface{})
	m["opt"] = "startPair"
	m["roomName"] = c.roomName
	pair2 := h.pair2[c.roomName]
	pair2.send <- m
}

func (c *connection) iceCandidate(m map[string]interface{}) {
	if c.no == "1" {
		pair2 := h.pair2[c.roomName]
		pair2.send <- m
	} else if c.no == "2" {
		pair1 := h.pair1[c.roomName]
		pair1.send <- m
	}
}

func (c *connection) offer(m map[string]interface{}) {
	pair2 := h.pair2[c.roomName]
	pair2.send <- m
}

func (c *connection) answer(m map[string]interface{}) {
	pair1 := h.pair1[c.roomName]
	pair1.send <- m
}

// func (c *connection) keyboard(m map[string]interface{}) {
// 	// log.Println(m["keyCode"] + ": " + m["value"] + " " + m["time"] + " " + m["to"])
// 	m["from"] = c.no
// 	m["roomName"] = c.roomName
// 	// log.Println(m["keyCode"] + ": " + m["value"] + " " + m["time"] + " " + m["to"])
// 	pair1 := h.pair1[c.roomName]
// 	pair1.send <- m
// }

func (c *connection) leavePair(roomName string) {
	m := make(map[string]interface{})
	m["name"] = c.name
	c.no = "0"
	if c.roomName != "" && c.roomName != roomName {
		m["empty"] = "false"
		if c == h.pair1[c.roomName] {
			m["opt"] = "leavePair"
			m["ip"] = c.ip
			m["roomName"] = c.roomName

			delete(h.pair1, c.roomName)
			if _, ok1 := h.pair1[c.roomName]; !ok1 {
				if _, ok2 := h.pair2[c.roomName]; !ok2 {
					m["empty"] = "true"
				}
			}
			log.Println("leavePair")
			c.broadcast(m)
			if _, ok2 := h.pair2[c.roomName]; ok2 {
				h.pair1[c.roomName] = h.pair2[c.roomName]
				delete(h.pair2, c.roomName)
			}
			c.roomName = ""
			log.Println("leave success1")
		} else if c == h.pair2[c.roomName] {
			m["opt"] = "leavePair"
			m["ip"] = c.ip
			m["roomName"] = c.roomName

			delete(h.pair2, c.roomName)
			if _, ok1 := h.pair1[c.roomName]; !ok1 {
				if _, ok2 := h.pair2[c.roomName]; !ok2 {
					m["empty"] = "true"
				}
			}
			c.broadcast(m)
			c.roomName = ""
			log.Println("leave success2")
		} else {
			c.roomName = ""
			log.Println("not in a pair")
		}
	}
}
