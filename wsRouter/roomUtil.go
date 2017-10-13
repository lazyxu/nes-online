package wsRouter

import (
	"github.com/MeteorKL/koala/logger"
	"strconv"
)

func roomInfo(r *Room) map[string]interface{} {
	if r == nil {
		return nil
	}
	return map[string]interface{}{
		"id":            r.id,
		"game":          r.game,
		"name":          r.name,
		"hostID":        r.hostID,
		"playerNames":   r.playerNames,
		"playerAvatars": r.playerAvatars,
		"playerStates":  r.playerStates,
		"state":         r.state,
	}
}

func roomlist() (roomlist []interface{}) {
	h.roomMutex.RLock()
	for _, r := range h.rooms {
		r.mutex.RLock()
		roomlist = append(roomlist, map[string]interface{}{
			"id":     r.id,
			"name":   r.name,
			"host":   r.hostName,
			"game":   r.game,
			"number": strconv.FormatInt(int64(r.playerCount), 10) + "/" + strconv.Itoa(len(r.players)),
			"state":  r.state,
		})
		r.mutex.RUnlock()
	}
	h.roomMutex.RUnlock()
	return
}

func sendRoomList() {
	h.userMutex.RLock()
	for _, users := range h.users {
		for _, user := range users {
			if user.msg == nil {
				logger.Info("channel is nil")
				user.out()
			}
			if user.state == "在线" {
				select {
				case user.msg <- map[string]interface{}{
					"type":     "roomList",
					"roomList": roomlist(),
				}:
				default:
					logger.Warn("channel is full !")
				}
			}
		}
	}
	h.userMutex.RUnlock()
}
