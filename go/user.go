package main

import "log"

func getUserList() []map[string]interface{} {
	list := make([]map[string]interface{}, 0)
	for conn, ok := range h.Connections {
		if !ok {
			log.Println(conn)
		}
		list = append(list, map[string]interface{}{
			"name": conn.UserName,
		})
	}
	return list
}

func getRoomList() []map[string]interface{} {
	list := make([]map[string]interface{}, 0)
	for conn, ok := range h.Connections {
		if !ok {
			log.Println(conn)
		}
		list = append(list, map[string]interface{}{
			"name": conn.UserName,
			// "RoomName":     r.Name,
			// "GameName":     r.GameName,
			// "RoomID":       r.ID,
			// "PlayerNum":    r.PlayerNum,
			// "PlayerMaxNum": r.PlayerMaxNum,
		})
	}
	return list
}
