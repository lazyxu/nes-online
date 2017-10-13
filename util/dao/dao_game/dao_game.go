package dao_game

import (
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/nes-online/util/logger"
	"github.com/MeteorKL/nes-online/util/mgo_session"
)

var db = config.Conf.Mgo.Database
const collection = "game"

func GetAll() (gameList []interface{}) {
	session := mgo_session.Get()
	defer session.Close()
	err := session.DB(db).C(collection).Find(
		nil,
	).All(&gameList)
	logger.Warn(err)
	return gameList
}

func Insert(docs ...interface{}) bool {
	session := mgo_session.Get()
	defer session.Close()
	err := session.DB(db).C(collection).Insert(
		docs,
	)
	logger.Warn(err)
	return err != nil
}