package wsRouter

import (
	"github.com/MeteorKL/nes-online/util/constant"
	"sync"
)

type hub struct {
	userMutex sync.RWMutex
	users     [constant.USER_MAX]map[string]*User

	roomMutex sync.RWMutex
	rooms     map[int]*Room
	roomCount int
}

// type Keyboard struct {
// 	key   int
// 	value int
// }

var h *hub

func NewHub() *hub {
	h = &hub{
		rooms:     make(map[int]*Room),
		roomCount: 10000,
	}
	h.userMutex.Lock()
	for i := 0; i < constant.USER_MAX; i++ {
		h.users[i] = make(map[string]*User)
	}
	h.userMutex.Unlock()
	return h
}

func getRoom(id int) *Room {
	h.roomMutex.RLock()
	if room, exist := h.rooms[id]; exist {
		return room
	}
	h.roomMutex.RUnlock()
	return nil
}

func createRoom(u *User, game string) int {
	h.roomMutex.Lock()
	id := h.roomCount
	u.state = "房间中，" + game
	u.idInRoom = 0
	r := &Room{
		id:            id,
		name:          u.name,
		game:          game,
		password:      "",
		state:         constant.ROOM_STATE_NORMAL,
		playerCount:   1,
		players:       []*User{u, nil},
		playerNames:   []string{u.name, ""},
		playerAvatars: []string{u.avatar, constant.ROOM_AVATAR_TOPN},
		playerStates:  []int{constant.ROOM_PLAYER_STATE_UNREADY, constant.ROOM_PLAYER_STATE_EMPTY},
		hostName:      u.name,
		hostID:        u.idInRoom,
	}
	h.rooms[id] = r
	u.room = r
	h.roomCount++
	h.roomMutex.Unlock()
	return id
}

func delRoom(id int) {
	h.roomMutex.Lock()
	delete(h.rooms, id)
	h.roomCount--
	h.roomMutex.Unlock()
}

func getRoomCount() int {
	h.roomMutex.RLock()
	roomCount := h.roomCount
	h.roomMutex.RUnlock()
	return roomCount
}

func getUser(typ int, name string) *User {
	h.userMutex.RLock()
	user := h.users[typ][name]
	h.userMutex.RUnlock()
	return user
}

func addUser(u *User) (*User, bool) {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if user, exist := h.users[u.typ][u.name]; exist {
		return user, false
	}
	h.users[u.typ][u.name] = u
	return nil, true
}

func delUser(u *User) {
	h.roomMutex.Lock()
	if h.users[u.typ][u.name] == u {
		delete(h.users[u.typ], u.name)
	}
	h.roomCount--
	h.roomMutex.Unlock()
}
