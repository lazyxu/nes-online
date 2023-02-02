package dao_game

import (
	"context"

	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/mgo_session"
	"go.mongodb.org/mongo-driver/bson"
)

const db = "nes"
const collection = "game"

func GetAll() (gameList []map[string]interface{}) {
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	cursor, err := coll.Find(context.TODO(),
		bson.M{},
	)
	if err != nil {
		logger.Warn(err)
		return nil
	}
	err = cursor.All(context.TODO(), &gameList)
	if err != nil {
		logger.Warn(err)
		return nil
	}
	return gameList
}

func Insert(docs []interface{}) bool {
	client := mgo_session.Get()
	defer client.Disconnect(context.TODO())
	coll := client.Database(db).Collection(collection)
	_, err := coll.InsertMany(context.TODO(),
		docs,
	)
	logger.Warn(err)
	return err == nil
}
