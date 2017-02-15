package koala

import "log"

var debug = false

func debugLog(info interface{}) {
	if debug {
		log.Println(info)
	}
}
