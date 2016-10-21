package main

import (
	"log"
	"strconv"
)

func (c *connection) createPair(m map[string]string) {
	c.leavePair("")
	c.roomName = strconv.Itoa(h.numPair)
	log.Println(c.roomName)
	h.gamePathPair[c.roomName] = m["url"]
	log.Println(h.gamePathPair[c.roomName])
	h.pair1[c.roomName] = c
	h.pairReady[c.roomName] = false
	delete(h.pair2, c.roomName)
	h.numPair++
	log.Println("create success")

	m["opt"] = "createPair"
	m["ip"] = c.ip
	m["roomName"] = c.roomName
	h.msg <- m
}

func (c *connection) joinPair(m map[string]string) string {
	msg := ""
	c.leavePair(m["roomName"])
	c.roomName = m["roomName"]
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
			msg = "join success"
			h.msgPair <- m
		}
	} else {
		msg = "no sucn a pair"
	}
	log.Println(c.roomName + ":" + msg)
	return msg
}

func (c *connection) readyPair(m map[string]string) {
	h.msgPair <- m
	mm := make(map[string]string)
	mm["opt"] = "buttonSetPair"
	mm["roomName"] = c.roomName
	mm["KEY_UP"] = m["KEY_UP"]
	mm["KEY_DOWN"] = m["KEY_DOWN"]
	mm["KEY_LEFT"] = m["KEY_LEFT"]
	mm["KEY_RIGHT"] = m["KEY_RIGHT"]
	mm["KEY_SELECT"] = m["KEY_SELECT"]
	mm["KEY_START"] = m["KEY_START"]
	mm["KEY_A"] = m["KEY_A"]
	mm["KEY_B"] = m["KEY_B"]
	mm["url"] = h.gamePathPair[c.roomName]
	if _, ok := h.pair1[c.roomName]; ok {
		if c == h.pair1[c.roomName] {
			mm["from"] = "1"
			mm["to"] = "2"
			h.buttonSetPair1 = mm
		} else if _, ok := h.pair2[c.roomName]; ok {
			if c == h.pair2[c.roomName] {
				mm["from"] = "2"
				mm["to"] = "1"
				h.buttonSetPair2 = mm
			}
		}
	}

	if h.pairReady[c.roomName] == false {
		h.pairReady[c.roomName] = true
	} else {
		log.Println(h.pairReady[c.roomName])
		h.msgPair <- h.buttonSetPair1
		h.msgPair <- h.buttonSetPair2
	}
}

func (c *connection) keyboard(m map[string]string) {
	log.Println(m["keyCode"] + ": " + m["value"])
	if _, ok := h.pair1[c.roomName]; ok {
		if c == h.pair1[c.roomName] {
			m["from"] = "1"
			// m["to"] = "2"
		} else if _, ok := h.pair2[c.roomName]; ok {
			if c == h.pair2[c.roomName] {
				m["from"] = "2"
				// m["to"] = "1"
			}
		}
	}
	h.msgPair <- m
}

func (c *connection) leavePair(roomName string) {
	m := make(map[string]string)
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
			h.msg <- m
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
			h.msg <- m
			c.roomName = ""
			log.Println("leave success2")
		} else {
			c.roomName = ""
			log.Println("not in a pair")
		}
	}
}
