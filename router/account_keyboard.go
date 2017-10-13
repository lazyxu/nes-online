package router

import (
	"encoding/json"
	"github.com/MeteorKL/koala"
	"net/http"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
)

func getKeyboard(name string) interface{} {
	user := dao_user.Get(
		bson.M{
			"name": name,
		},
		bson.M{
			"_id":      0,
			"keyboard": 1,
		},
	)
	return user["keyboard"]
}

func setKeyboard(name string, keyboard map[string]int) {
	dao_user.Update(
		bson.M{
			"name": name,
		}, bson.M{
			"keyboard": keyboard,
		},
		nil,
	)
}

func apiKeyboard() {
	koala.Get("/api/getKeyboard", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		koala.WriteJSON(w, getKeyboard(k.ParamGet["name"][0]))
	})
	koala.Post("/api/setKeyboard", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		keyboard := make(map[string]int)
		json.Unmarshal([]byte(k.ParamPost["keyboard"][0]), &keyboard)
		setKeyboard(k.ParamGet["name"][0], keyboard)
		koala.WriteJSON(w, map[string]interface{}{
			"state": true,
			"msg":   "修改成功",
		})
	})
	koala.Post("/api/register", register)
}
