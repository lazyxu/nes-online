package logger

import (
	"log"
)

const (
	debug = iota
	info
	warn
	error
	fatal
)

var logLevels = map[string]int{
	"debug": 0,
	"info":  1,
	"warn":  2,
	"error": 3,
	"fatal": 4,
}

var logLevel = 1

func SetLogLevel(level string) {
	logLevel = logLevels[level]
}

func check(level int) bool {
	return level >= logLevel
}

func Debug(msg interface{}) {
	if check(debug) {
		log.Println("[debug] ", msg)
	}
}

func Info(msg interface{}) {
	if check(info) {
		log.Println("[INFO] ", msg)
	}
}

func Warn(msg interface{}) {
	if check(warn) {
		log.Println("[WARN] ", msg)
	}
}

func Error(msg interface{}) {
	if check(error) {
		log.Println("[ERROR] ", msg)
	}
}

func Fatal(msg interface{}) {
	if check(fatal) {
		log.Panic("[FATAL] ", msg)
	}
}
