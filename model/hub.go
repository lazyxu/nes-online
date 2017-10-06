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
	return h
	// h.users["MeteorKL"] = &User{
	// 	Name:   "MeteorKL",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["官方客服"] = &User{
	// 	Name:   "官方客服",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["0xcccc"] = &User{
	// 	Name:   "0xcccc",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["666"] = &User{
	// 	Name:   "666",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["233"] = &User{
	// 	Name:   "233",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["555"] = &User{
	// 	Name:   "555",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
	// h.users["🐷"] = &User{
	// 	Name:   "🐷",
	// 	Avatar: "/img/Avatar/239936e7efe6089784cf739878b5165a.jpg",
	// }
}
