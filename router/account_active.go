package router

import (
	"net/http"
	"time"

	"github.com/MeteorKL/koala"

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
		writeErrJSON(w, "激活失败")
		return
	}
	if time.Now().Unix()-user["updated_at"].(int64) > 3600 {
		writeErrJSON(w, "超过1h，激活码已失效")
		return
	}
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
	writeSuccessJSON(w, "激活成功", nil)
}

func apiActive() {
	koala.Post("/api/active", active)
}
