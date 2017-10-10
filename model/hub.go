package model

import "github.com/MeteorKL/nes-online/router"

type Hub struct {
	users     [router.USER_MAX]map[string]*User
	rooms     map[int]*Room
	roomCount int
}

// type Keyboard struct {
// 	key   int
// 	value int
// }

var h *Hub

func NewHub() *Hub {
	h = &Hub{
		rooms:     make(map[int]*Room),
		roomCount: 10000,
	}
	for i := 0; i < router.USER_MAX; i++ {
		h.users[i] = make(map[string]*User)
	}
	return h
}
