package mgo_session

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/config"
)

func Get() *mongo.Client {
	logger.Debug("config.mgo:")
	logger.Debug(config.Conf.MgoUrl)
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(config.Conf.MgoUrl))
	if err != nil {
		panic(err)
	}
	// Ping the primary
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		panic(err)
	}
	fmt.Println("Successfully connected and pinged.")
	return client
}
