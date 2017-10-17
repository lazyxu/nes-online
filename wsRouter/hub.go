package wsRouter

import (
	"github.com/MeteorKL/nes-online/util/constant"
	"sync"
)

type hub struct {
	userMutex sync.RWMutex
	users     [constant.USER_MAX]map[string]*User

	roomMutex       sync.RWMutex
	rooms           map[int]*Room
	roomCount       int
	roomUpdateCount int
}

var h *hub

func NewHub() *hub {
	h = &hub{
		rooms:     make(map[int]*Room),
		roomCount: 10000,
	}
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	for i := 0; i < constant.USER_MAX; i++ {
		h.users[i] = make(map[string]*User)
	}
	return h
}

func getRoom(id int) *Room {
	h.roomMutex.RLock()
	defer h.roomMutex.RUnlock()
	if room, exist := h.rooms[id]; exist {
		return room
	}
	return nil
}

func createRoom(u *User, game string) int {
	h.roomMutex.Lock()
	id := h.roomCount
	u.State = "房间中，" + game
	u.IdInRoom = 0
	r := &Room{
		ID:          id,
		Name:        u.Name,
		Game:        game,
		password:    "",
		State:       constant.ROOM_STATE_NORMAL,
		PlayerCount: 1,
		Players:     []*User{u, nil},
		HostID:      u.IdInRoom,
		operation:   [][]int64{{}, {}},
	}
	h.rooms[id] = r
	u.room = r
	h.roomCount++
	h.roomMutex.Unlock()
	return id
}

func delRoom(id int) {
	h.roomMutex.Lock()
	defer h.roomMutex.Unlock()
	delete(h.rooms, id)
}

func addUser(u *User) (*User, bool) {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if user, exist := h.users[u.Typ][u.Name]; exist && user != nil {
		return user, false
	}
	h.users[u.Typ][u.Name] = u
	return nil, true
}

func Login(typ int, name string) bool {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if _, exist := h.users[typ][name]; exist {
		return false
	}
	h.users[typ][name] = nil
	return true
}

func IsLogin(typ int, name string) bool {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if _, exist := h.users[typ][name]; exist {
		return true
	}
	return false
}

func checkUser(u *User) bool {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if user, exist := h.users[u.Typ][u.Name]; exist {
		return user == u
	}
	return false
}

func delUser(u *User) {
	h.userMutex.Lock()
	defer h.userMutex.Unlock()
	if h.users[u.Typ][u.Name] == u {
		delete(h.users[u.Typ], u.Name)
	}
}
