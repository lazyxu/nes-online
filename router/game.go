package router

import (
	"io/ioutil"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/MeteorKL/koala"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_game"
	"github.com/MeteorKL/koala/logger"
)

var gameList []interface{}
var updateGameListCount int32
var gameListMutex sync.RWMutex

func updateGameList() {
	if atomic.LoadInt32(&updateGameListCount)%100 == 0 {
		logger.Info("更新游戏列表")
		gameListMutex.Lock()
		gameList = dao_game.GetAll()
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
	writeSuccessJSON(w, "", gameList)
}

func initGame(dirPth string) {
	dir, err := ioutil.ReadDir(dirPth)
	if err != nil {
		logger.Error("读取nes文件夹失败")
	}
	var gameList []bson.M
	for _, fi := range dir {
		if fi.IsDir() { // 忽略目录
			continue
		}
		if strings.HasSuffix(fi.Name(), ".nes") { //匹配文件
			name := strings.TrimSuffix(fi.Name(), ".nes")
			gameList = append(gameList, bson.M{
				"name": name,
			})
		}
	}
	if !dao_game.Insert(gameList) {
		logger.Error("更新游戏列表失败")
	}
}
