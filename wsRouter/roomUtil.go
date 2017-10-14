package wsRouter

import (
	"github.com/MeteorKL/koala/logger"
)

func sendRoomList() {
	h.userMutex.RLock()
	defer h.userMutex.RUnlock()
	for _, users := range h.users {
		for _, user := range users {
			if user.msg == nil {
				logger.Info("channel is nil")
				user.out()
			}
			if user.State == "在线" {
				select {
				case user.msg <- map[string]interface{}{
					"type":     "roomList",
					"roomList": h.rooms,
				}:
				default:
					logger.Warn("channel is full !")
				}
			}
		}
	}
}
