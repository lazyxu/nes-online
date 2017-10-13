package dao_user

import (
	"time"
	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/constant"
	"regexp"
	"github.com/MeteorKL/nes-online/util/logger"
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/nes-online/util/mgo_session"
)

type User struct {
}

var db = config.Conf.Mgo.Database

const collection = "user"

func Login(account string, password string) map[string]interface{} {
	match, _ := regexp.MatchString(`(\w-*\.*)+@(\w-?)+(\.\w{2,})+`, account)
	accountType := ""
	if match {
		accountType = "mail"
	} else {
		accountType = "name"
	}
	return Get(
		bson.M{
			accountType: account,
			"password":  password,
		}, bson.M{
			"_id":      0,
			"password": 0,
		},
	)
}

func Get(query bson.M, selector bson.M) map[string]interface{} {
	user := make(map[string]interface{})
	session := mgo_session.Get()
	defer session.Close()
	err := session.DB(db).C(collection).Find(
		query,
	).Select(
		selector,
	).One(&user)
	logger.Warn(err)
	return user
}

func Exist(query bson.M) bool {
	session := mgo_session.Get()
	defer session.Close()
	n, err := session.DB(db).C(collection).Find(query).Count()
	logger.Warn(err)
	return n != 0
}

func Update(selector bson.M, set bson.M, unset bson.M) bool {
	session := mgo_session.Get()
	defer session.Close()
	err := session.DB(db).C(collection).Update(
		selector,
		bson.M{
			"$set":   set,
			"$unset": unset,
		},
	)
	logger.Warn(err)
	return err != nil
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

func ThirdPartyLogin(thirdPartyType string, name string, avatarURL string) map[string]interface{} {
	session := mgo_session.Get()
	defer session.Close()
	n, err := session.DB(db).C(collection).Find(map[string]interface{}{
		thirdPartyType: name,
	}).Count()
	logger.Warn(err)
	if n == 0 {
		if !Insert(bson.M{
			thirdPartyType: name,
			"name":         name + "@" + thirdPartyType,
			"avatar":       avatarURL,
			"created_at":   time.Now().Unix(),
			"updated_at":   time.Now().Unix(),
			"keyboard":     constant.DEFAULT_KEYBOARD,
		}) {
			logger.Warn(name+"@"+thirdPartyType+"注册失败")
			return nil
		}
	} else {
		if !Update(
			bson.M{
				thirdPartyType: name,
			}, bson.M{
				"avatar":     avatarURL,
				"updated_at": time.Now().Unix(),
			},
			nil,
		) {
			logger.Warn(name+"@"+thirdPartyType+"更新信息失败")
			return nil
		}
	}
	return Get(
		bson.M{
			thirdPartyType: name,
		},bson.M{
			"_id":      0,
			"password": 0,
		},
	)
}
