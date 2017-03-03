package main

import (
	"encoding/json"
	"nes-online/koala"
	"net/http"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func getKeyboard(name string) interface{} {
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			"name": name,
		}).One(&user)
		return user, err
	})
	return user["keyboard"]
}

func setKeyboard(name string, keyboard map[string]int) {
	queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
		err := c.Update(map[string]interface{}{
			"name": name,
		}, bson.M{
			"$set": bson.M{
				"keyboard": keyboard,
			},
		})
		return nil, err
	})
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
