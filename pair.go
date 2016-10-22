package main

import (
	"fmt"
	"log"
	"reflect"
	"strconv"
	"time"
)

func (c *connection) createPair(m map[string]string) {
	log.Println(time.Now().Unix())
	log.Println(time.Now().UnixNano())
	c.leavePair("")
	c.roomName = strconv.Itoa(h.numPair)
	log.Println(c.roomName)
	h.gamePathPair[c.roomName] = m["url"]
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
			c.no = "2"
			m["from"] = "2"
			msg = "join success"
			h.msgPair <- m
		}
	} else {
		msg = "no sucn a pair"
	}
	log.Println(c.roomName + ":" + msg)
	return msg
}

func stringToInt64() {
	s := "9223372036854775807"
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Hello, %v with type %s!\n", i, reflect.TypeOf(i))
}

func (c *connection) readyPair(m map[string]string) {
	m["no"] = c.no
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
	if c.no == "1" {
		mm["from"] = "1"
		mm["to"] = "2"
		h.buttonSetPair1 = mm
	} else if c.no == "2" {
		mm["from"] = "2"
		mm["to"] = "1"
		h.buttonSetPair2 = mm
	}
	if h.pairReady[c.roomName] == false {
		h.pairReady[c.roomName] = true
	} else {
		log.Println(h.pairReady[c.roomName])
		h.msgPair <- h.buttonSetPair1
		h.msgPair <- h.buttonSetPair2
	}
}

func (c *connection) checkTime1(m map[string]string, all bool) {
	if all {
		m["from"] = "1"
		s1 := time.Now().UnixNano() / 1000000
		m["s1"] = strconv.FormatInt(s1, 10)
		h.msgPair <- m
		mm := make(map[string]string)

		mm["opt"] = "checkTime1"
		mm["from"] = "2"
		s1 = time.Now().UnixNano() / 1000000
		mm["s1"] = strconv.FormatInt(s1, 10)
		h.msgPair <- mm
	} else {
		if c.no == "1" {
			m["from"] = "1"
			m["to"] = "2"
		} else if c.no == "2" {
			m["from"] = "2"
			m["to"] = "1"
		}
		s1 := time.Now().UnixNano() / 1000000
		m["s1"] = strconv.FormatInt(s1, 10)
		h.msgPair <- m
	}
}

func (c *connection) checkTime2(m map[string]string) {
	s1, _ := strconv.ParseInt(m["s1"], 10, 64)
	s2 := time.Now().UnixNano() / 1000000
	trueTime := (s1 + s2) / 2
	c.ping = s2 - s1
	// if c.ping < 0 {
	// 	c.ping += 60000
	// 	trueTime = (s1 + s2 + 60000) / 2
	// 	if trueTime > 60000 {
	// 		trueTime -= 60000
	// 	}
	// }
	// log.Println("s2:")
	// log.Println(s2)
	m["time"] = strconv.FormatInt(trueTime, 10)
	m["ping"] = strconv.FormatInt(c.ping, 10)
	h.msgPair <- m
}

func (c *connection) checkTimeOK() {
	m := make(map[string]string)
	if h.pairStart[c.roomName] == false {
		h.pairStart[c.roomName] = true
	} else {
		m["opt"] = "startPair"
		ping2 := h.pair2[c.roomName].ping
		if c.no == "2" {
			ping2 = h.pair1[c.roomName].ping
		}
		maxPing := c.ping
		if ping2 > c.ping {
			maxPing = ping2
		}
		log.Println(maxPing)
		h.maxPingPair[c.roomName] = maxPing
		time := time.Now().UnixNano() / 1000000
		m["roomName"] = c.roomName
		m["time"] = strconv.FormatInt(time+maxPing*2, 10)
		h.msgPair <- m
	}
}

func (c *connection) keyboard(m map[string]string) {
	// log.Println(m["keyCode"] + ": " + m["value"] + " " + m["time"] + " " + m["to"])
	delete(m, "to") // 哪里冒出来的啊
	m["from"] = c.no
	m["roomName"] = c.roomName
	time := time.Now().UnixNano() / 1000000
	m["time"] = strconv.FormatInt(time+h.maxPingPair[c.roomName]*2, 10)
	// log.Println(m["keyCode"] + ": " + m["value"] + " " + m["time"] + " " + m["to"])
	h.msgPair <- m
}

func (c *connection) leavePair(roomName string) {
	m := make(map[string]string)
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
