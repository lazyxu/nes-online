package config

import (
	"io/ioutil"
	"log"
	"encoding/json"
	"github.com/MeteorKL/nes-online/util/logger"
)

type Config struct {
	LogLevel string `json:"log_level"`
	Github struct {
		Client_id     string `json:"client_id"`
		Client_secret string `json:"client_secret"`
	} `json:"github"`
	QQ   struct {
		Appid  string `json:"appid"`
		Appkey string`json:"appkey"`
	}   `json:"qq"`
	Mail struct {
		User     string `json:"user"`
		Password string `json:"password"`
		Host     string `json:"host"`
		Port     int    `json:"port"`
	} `json:"mail"`
	Mgo  struct {
		Addrs     []string `json:"addrs"`
		Username  string   `json:"username"`
		Password  string   `json:"password"`
		Database  string   `json:"database"`
		Source    string   `json:"source"`
		Mechanism string   `json:"mechanism"`
	}  `json:"mgo"`
}

var Conf Config

func Load() {
	if bytes, err := ioutil.ReadFile("config.json"); err == nil {
		if err := json.Unmarshal(bytes, &Conf); err != nil {
			logger.Fatal("error in json.Unmarshal, ")
		}
	} else {
		log.Panic("error in ioutil.ReadFile, ", err.Error())
	}
}