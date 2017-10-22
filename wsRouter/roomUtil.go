package wsRouter

import (
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/constant"
)


func updateRoomState(r *Room) {
	existInGame := false
	for _, user := range r.Players {
		if user != nil && user.StateInRoom == constant.ROOM_PLAYER_STATE_IN_GAME {
			existInGame = true
		}
	}
	if !existInGame {
		r.State = constant.ROOM_STATE_NORMAL
	}
}

func sendRoomList() {
	h.roomMutex.RLock()
	defer h.roomMutex.RUnlock()
	for _, users := range h.users {
		for _, user := range users {
			if user.msg == nil {
				logger.Warn(user.Name+" channel is nil")
				continue
			}
			if user.State == "在线" {
				select {
				case user.msg <- map[string]interface{}{
					"type":     "roomList",
					"roomList": h.rooms,
				}:
				default:
					logger.Warn(user.Name+" channel is full")
				}
			}
		}
	}
}
