package router

import (
	"net/http"
	"time"

	"github.com/MeteorKL/koala"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
)

func active(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	user := dao_user.Get(
		bson.M{
			"active_code": k.ParamPost["active_code"][0],
		}, bson.M{
			"_id":        0,
			"updated_at": 1,
		},
	)
	if len(user) == 0 {
		writeErrJSON(w, "激活失败")
		return
	}
	if time.Now().Unix()-user["updated_at"].(int64) > 3600 {
		writeErrJSON(w, "超过1h，激活码已失效")
		return
	}
	dao_user.Update(
		bson.M{
			"active_code": k.ParamPost["active_code"][0],
		}, bson.M{
			"active_code": 1,
		}, bson.M{
			"updated_at": time.Now().Unix(),
		},
	)
	writeSuccessJSON(w, "激活成功", nil)
}

func apiActive() {
	koala.Post("/api/active", active)
}
