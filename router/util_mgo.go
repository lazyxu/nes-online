package router

import (
	"time"

	"gopkg.in/mgo.v2"
	"log"
)

var mgoSession *mgo.Session

func getSession() *mgo.Session {
	log.Println(config.Mgo)
	if mgoSession == nil {
		var err error
		mongoDBDialInfo := &mgo.DialInfo{
			Addrs:     config.Mgo.Addrs,
			Username:  config.Mgo.Username,
			Password:  config.Mgo.Password,
			Database:  config.Mgo.Database,
			Source:    config.Mgo.Source,
			Mechanism: config.Mgo.Mechanism,
			Timeout:   60 * time.Second,
		}
		mgoSession, err = mgo.DialWithInfo(mongoDBDialInfo) //连接数据库
		if err != nil {
			panic(err) // no, not really
		}
	}
	return mgoSession.Clone()
}

func queryInCollection(collection string, query func(*mgo.Collection) (interface{}, error)) (interface{}, error) {
	session := getSession()
	defer session.Close()
	c := session.DB(config.Mgo.Database).C(collection)
	return query(c)
}

func getCountFromCollection(collection string, query func(*mgo.Collection) (int, error)) (int, error) {
	session := getSession()
	defer session.Close()
	c := session.DB(config.Mgo.Database).C(collection)
	return query(c)
}

func selectFromCollection(collection string, query func(*mgo.Collection) (map[string]interface{}, error)) (map[string]interface{}, error) {
	session := getSession()
	defer session.Close()
	c := session.DB(config.Mgo.Database).C(collection)
	return query(c)
}
