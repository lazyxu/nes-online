package router

import (
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/MeteorKL/koala"

	"fmt"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var gameList interface{}
var gameListErr error
var updateGameListCount int32
var gameListMutex sync.RWMutex

func updateGameList() {
	if atomic.LoadInt32(&updateGameListCount)%100 == 0 {
		gameListMutex.Lock()
		gameList, gameListErr = queryInCollection("game", func(c *mgo.Collection) (interface{}, error) {
			var gameList []interface{}
			err := c.Find(nil).All(&gameList)
			return gameList, err
		})
		gameListMutex.Unlock()
	}
	atomic.AddInt32(&updateGameListCount, 1)
}

func getGameList(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	if gameList == nil {
		updateGameList()
	} else {
		go updateGameList()
	}
	if gameListErr != nil {
		writeErrJSON(w, gameListErr.Error())
		return
	}
	writeSuccessJSON(w, "", gameList)
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
