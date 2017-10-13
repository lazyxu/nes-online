package router

import (
	"encoding/json"
	"net/http"

	"github.com/MeteorKL/koala"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
)

func apiUser() {
	koala.Post("/api/settingUpdate", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		oldName := k.ParamPost["oldName"][0]
		name := k.ParamPost["name"][0]
		if oldName != name {
			exist := existName(name)
			if exist {
				writeErrJSON(w, "该昵称已被使用")
				return
			}
		}
		keyboard := make(map[string]int)
		json.Unmarshal([]byte(k.ParamPost["keyboard"][0]), &keyboard)
		dao_user.Update(
			bson.M{
				"name": oldName,
			}, bson.M{
				"name":     name,
				"keyboard": keyboard,
			}, nil,
		)
		koala.WriteJSON(w, map[string]interface{}{
			"state":    true,
			"msg":      "修改成功",
			"name":     name,
			"keyboard": keyboard,
		})
	})
}
