package router

import (
	"crypto/sha256"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/MeteorKL/koala"

	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/dao/dao_game"
	"go.mongodb.org/mongo-driver/bson"
)

var gameList []map[string]interface{}
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

func getGameList(c *koala.Context) {
	if gameList == nil {
		updateGameList()
	} else {
		go updateGameList()
	}
	writeSuccessJSON(c, "", gameList)
}

func GetSHA256FromFile(path string) (string, error) {
	f, err := os.Open(path)
	defer f.Close()
	if err != nil {
		return "", err
	}
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	sum := fmt.Sprintf("%x", h.Sum(nil))
	return sum, nil
}

func initGame(dirPth string) {
	logger.Info("等待更新游戏列表...")
	dir, err := ioutil.ReadDir(dirPth)
	if err != nil {
		logger.Error("读取nes文件夹失败")
		return
	}
	var gameList []interface{}
	for _, fi := range dir {
		if fi.IsDir() { // 忽略目录
			continue
		}
		if strings.HasSuffix(fi.Name(), ".nes") { //匹配文件
			logger.Debug(fi.Name())
			name := strings.TrimSuffix(fi.Name(), ".nes")
			hash, err := GetSHA256FromFile(filepath.Join(dirPth, fi.Name()))
			if err != nil {
				panic(err)
			}
			logger.Debug(hash)
			gameList = append(gameList, bson.M{
				"_id":  hash,
				"name": name,
			})
		}
	}
	if !dao_game.Insert(gameList) {
		logger.Error("更新游戏列表失败")
		return
	}
	logger.Info("更新游戏列表成功")
}

func apiGame() {
	initGame("static/roms")
	app.Get("/api/getGameList", getGameList)
}
