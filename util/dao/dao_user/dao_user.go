package dao_user

import (
	"context"
	"regexp"
	"time"

	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/constant"
	"github.com/MeteorKL/nes-online/util/mgo_session"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type User struct {
}

const db = "nes"
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
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	err := coll.FindOne(context.TODO(),
		query, &options.FindOneOptions{
			Projection: selector,
		},
	).Decode(&user)
	logger.Warn(err)
	return user
}

func Exist(query bson.M) bool {
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	err := coll.FindOne(context.TODO(), query).Err()
	logger.Warn(err)
	return err == nil
}

func Update(selector bson.M, set bson.M, unset bson.M) bool {
	var update bson.M
	if unset != nil {
		update = bson.M{
			"$set":   set,
			"$unset": unset,
		}
	} else {
		update = bson.M{
			"$set": set,
		}
	}
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	_, err := coll.UpdateOne(context.TODO(), selector, update)
	logger.Warn(err)
	return err == nil
}

func Insert(docs ...interface{}) bool {
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	_, err := coll.InsertMany(context.TODO(),
		docs,
	)
	logger.Warn(err)
	return err == nil
}

func ThirdPartyLogin(thirdPartyType string, name string, avatarURL string) map[string]interface{} {
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	err := coll.FindOne(context.TODO(), map[string]interface{}{
		thirdPartyType: name,
	}).Err()
	logger.Warn(err)
	if err != nil {
		if !Insert(bson.M{
			thirdPartyType: name,
			"name":         name + "@" + thirdPartyType,
			"avatar":       avatarURL,
			"created_at":   time.Now().Unix(),
			"updated_at":   time.Now().Unix(),
			"keyboard":     constant.DEFAULT_KEYBOARD,
		}) {
			logger.Warn(name + "@" + thirdPartyType + "注册失败")
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
			logger.Warn(name + "@" + thirdPartyType + "更新信息失败")
			return nil
		}
	}
	return Get(
		bson.M{
			thirdPartyType: name,
		}, bson.M{
			"_id":         0,
			"password":    0,
			"verify_code": 0,
			"updated_at":  0,
			"created_at":  0,
		},
	)
}
