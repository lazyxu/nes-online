package model

import (
	"strconv"
	"log"
)


func roomInfo(r *Room) map[string]interface{} {
	if r==nil {
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
	for _, r := range h.rooms {
		roomlist = append(roomlist, map[string]interface{}{
			"id":     r.id,
			"name":   r.name,
			"host":   r.hostName,
			"game":   r.game,
			"number": strconv.FormatInt(int64(r.playerCount), 10) + "/" + strconv.Itoa(len(r.players)),
			"state":  r.state,
		})
	}
	return
}

func sendRoomList() {
	for _, users := range h.users {
		for _, user := range users {
			if user.msg == nil {
				log.Println("channel is nil")
				user.out()
			}
			if user.state == "在线" {
				select {
				case user.msg <- map[string]interface{}{
					"type":     "roomList",
					"roomList": roomlist(),
				}:
				default:
					log.Println("channel is full !")
					// delete(h.users, user.Name)
					// close(user.Msg)
				}
			}
		}
	}
}