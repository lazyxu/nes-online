package main

import (
	"encoding/json"
	"github.com/MeteorKL/koala"
	"net/http"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiUser() {
	koala.Post("/api/settingUpdate", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		oldName := k.ParamPost["oldName"][0]
		name := k.ParamPost["name"][0]
		if oldName != name {
			state, msg := checkName(name)
			if !state {
				koala.WriteJSON(w, map[string]interface{}{
					"state": state,
					"msg":   msg,
				})
				return
			}
		}
		keyboard := make(map[string]int)
		json.Unmarshal([]byte(k.ParamPost["keyboard"][0]), &keyboard)
		queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Update(map[string]interface{}{
				"name": oldName,
			}, bson.M{
				"$set": bson.M{
					"name":     name,
					"keyboard": keyboard,
				},
			})
			return nil, err
		})
		koala.WriteJSON(w, map[string]interface{}{
			"state":    true,
			"msg":      "修改成功",
			"name":     name,
			"keyboard": keyboard,
		})
	})
}
