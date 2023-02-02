package router

import (
	"time"

	"github.com/MeteorKL/koala"

	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"go.mongodb.org/mongo-driver/bson"
)

func active(c *koala.Context) {
	user := dao_user.Get(
		bson.M{
			"active_code": c.GetBodyQueryString("active_code"),
		}, bson.M{
			"_id":        0,
			"updated_at": 1,
		},
	)
	if len(user) == 0 {
		writeErrJSON(c, "激活失败")
		return
	}
	if time.Now().Unix()-user["updated_at"].(int64) > 3600 {
		writeErrJSON(c, "超过1h，激活码已失效")
		return
	}
	dao_user.Update(
		bson.M{
			"active_code": c.GetBodyQueryString("active_code"),
		}, bson.M{
			"active_code": 1,
		}, bson.M{
			"updated_at": time.Now().Unix(),
		},
	)
	writeSuccessJSON(c, "激活成功", nil)
}

func apiActive() {
	app.Post("/api/active", active)
}
