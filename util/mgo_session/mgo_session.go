package mgo_session

import (
	"time"

	"gopkg.in/mgo.v2"
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/koala/logger"
)

var mgoSession *mgo.Session

func Get() *mgo.Session {
	logger.Debug("config.mgo:")
	logger.Debug(config.Conf.Mgo)
	if mgoSession == nil {
		var err error
		mongoDBDialInfo := &mgo.DialInfo{
			Addrs:     config.Conf.Mgo.Addrs,
			Username:  config.Conf.Mgo.Username,
			Password:  config.Conf.Mgo.Password,
			Database:  config.Conf.Mgo.Database,
			Source:    config.Conf.Mgo.Source,
			Mechanism: config.Conf.Mgo.Mechanism,
			Timeout:   60 * time.Second,
		}
		mgoSession, err = mgo.DialWithInfo(mongoDBDialInfo) //连接数据库
		if err != nil {
			panic(err) // no, not really
		}
	}
	return mgoSession.Clone()
}
