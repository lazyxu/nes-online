package router

import (
	"github.com/MeteorKL/koala"
	"strings"
	"github.com/MeteorKL/koala/logger"
	"io/ioutil"
	"encoding/base64"
)

const JPG_URL = "data:image/jpeg;base64,"
const DEFAULT_FOLDER  = "未分类"

func uploadROM(c *koala.Context) {
	folder := c.GetBodyQueryString("folder")
	if folder=="" {
		folder = DEFAULT_FOLDER
	}
	dir := "static/roms/"+c.GetBodyQueryString("folder")+"/"
	name, suffix, err := c.SavePostFile("rom", dir, []string{".nes",".NES"})
	logger.Debug(name)
	logger.Debug(suffix)
	if err != nil {
		logger.Warn(err)
		writeErrJSON(c, err.Error())
		return
	}
	name = strings.TrimSuffix(name, suffix)
	screenShot := c.GetBodyQueryString("screenShot")
	//logger.Debug(screenShot)
	if !strings.HasPrefix(screenShot, JPG_URL) {
		writeErrJSON(c, "未定义的图片类型")
		return
	}
	screenShot = strings.TrimPrefix(screenShot, JPG_URL)
	screenshot, err := base64.StdEncoding.DecodeString(screenShot)
	if err != nil {
		logger.Warn(err)
		writeErrJSON(c, "图片解析失败")
		return
	}
	ioutil.WriteFile(dir+name+".jpg", screenshot, 0666)
	writeSuccessJSON(c, "上传成功", nil)
}

//func uploadROM(c *koala.Context) {
//	romUpload := &RomUpload{}
//	//logger.Debug(c.GetBodyUnsafe())
//	err := json.Unmarshal(c.GetBodyUnsafe(), romUpload)
//	if err != nil {
//		logger.Warn(err)
//		writeErrJSON(c, "json格式不正确")
//		return
//	}
//	logger.Debug(romUpload.Name)
//	//logger.Debug(romUpload.Rom)
//	//logger.Debug(romUpload.ScreenShot)
//	//name := c.GetBodyQueryString("name")
//	//rom, err := base64.StdEncoding.DecodeString(c.GetBodyQueryString("rom"))
//	//logger.Warn(err)
//	ioutil.WriteFile(romUpload.Name+".nes", romUpload.Rom.([]byte), 0666)
//	//__screenShot, err := base64.StdEncoding.DecodeString(c.GetBodyQueryString("screenShot"))
//	//screenShot:= string(__screenShot)
//	//logger.Warn(err)
//	if !strings.HasPrefix(romUpload.ScreenShot, JPG_URL) {
//		writeErrJSON(c, "json格式不正确")
//		return
//	}
//	screenShot := strings.TrimPrefix(romUpload.ScreenShot, JPG_URL)
//	screenshot, err := base64.StdEncoding.DecodeString(screenShot)
//	logger.Warn(err)
//	ioutil.WriteFile(romUpload.Name+".jpg", screenshot, 0666)
//	writeSuccessJSON(c, "上传成功", nil)
//}

func apiRom() {
	app.Post("/api/uploadROM", uploadROM)
}
