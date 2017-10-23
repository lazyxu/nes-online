package router

import (
	"github.com/MeteorKL/koala"
	"net/http"
	"github.com/MeteorKL/koala/logger"
	"encoding/base64"
	"io/ioutil"
	"strings"
)

const (
	PNG_URL = "data:image/png;base64,"
	JPG_URL = "data:image/jpeg;base64,"
)

func uploadROM(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	name := k.ParamPost["name"][0]
	rom, err := base64.StdEncoding.DecodeString(k.ParamPost["rom"][0])
	logger.Warn(err)
	ioutil.WriteFile(name+".nes", rom, 0666)
	__screenShot, err := base64.StdEncoding.DecodeString(k.ParamPost["screenShot"][0])
	screenShot:= string(__screenShot)
	logger.Warn(err)
	if strings.HasPrefix(screenShot, JPG_URL) {
		screenShot = strings.TrimPrefix(screenShot, JPG_URL)
		screenshot, err := base64.StdEncoding.DecodeString(screenShot)
		logger.Warn(err)
		ioutil.WriteFile(name+".jpg", screenshot, 0666)
	} else {
		logger.Error("unkonw image type: " + screenShot)
	}
}
