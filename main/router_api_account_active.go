package main

import (
	"nes-online/koala"
	"net/http"
	"time"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func active(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			"active_code": k.ParamPost["active_code"][0],
		}).Select(bson.M{
			"_id":        0,
			"updated_at": 1,
		}).One(&user)
		return user, err
	})
	if len(user) == 0 {
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"msg":   "激活失败",
		})
		return
	}
	if time.Now().Unix()-user["updated_at"].(int64) <= 3600 {
		queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Update(map[string]interface{}{
				"active_code": k.ParamPost["active_code"][0],
			}, bson.M{
				"$unset": bson.M{
					"active_code": 1,
				},
				"$set": bson.M{
					"updated_at": time.Now().Unix(),
				},
			})
			return nil, err
		})
		koala.WriteJSON(w, map[string]interface{}{
			"state": true,
			"msg":   "激活成功",
		})
		return
	}
	koala.WriteJSON(w, map[string]interface{}{
		"state": false,
		"msg":   "超过1h，激活码已失效",
	})
}

func apiActive() {
	koala.Post("/api/active", active)
}
