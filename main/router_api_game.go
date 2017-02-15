package main

import (
	"io/ioutil"
	"log"
	"nes-online/koala"
	"net/http"
	"strings"

	"fmt"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func listGame(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	games, _ := queryInCollection("game", func(c *mgo.Collection) (interface{}, error) {
		var games []interface{}
		err := c.Find(nil).All(&games)
		return games, err
	})
	koala.WriteJSON(w, games)
}

func initGame(dirPth string) (interface{}, error) {
	dir, err := ioutil.ReadDir(dirPth)
	if err != nil {
		return nil, err
	}
	for _, fi := range dir {
		if fi.IsDir() { // 忽略目录
			continue
		}
		if strings.HasSuffix(fi.Name(), ".nes") { //匹配文件
			name := strings.TrimSuffix(fi.Name(), ".nes")
			info, err := queryInCollection("game", func(c *mgo.Collection) (interface{}, error) {
				info, err := c.Upsert(map[string]interface{}{
					"name": name,
				}, bson.M{
					"$set": map[string]interface{}{
						"name": name,
					},
				})
				return info, err
			})
			fmt.Println(info, name)
			if err != nil {
				log.Println(err)
			}
		}
	}
	return nil, err
}
