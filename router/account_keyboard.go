package router

import (
	"encoding/json"

	"github.com/MeteorKL/koala"

	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"github.com/MeteorKL/nes-online/util/session"
	"go.mongodb.org/mongo-driver/bson"
)

func getKeyboard(c *koala.Context) {
	if s := session.Store.PeekSession(c.Request, CookieName); s == nil {
		writeErrJSON(c, "请先登录")
	} else {
		if user, ok := s.Get("user").(map[string]interface{}); ok {
			writeSuccessJSON(c, "获取按键设置成功", user["keyboard"])
		} else {
			logger.Error("updateKeyboard in session failed")
			writeErrJSON(c, "获取按键设置失败")
		}
	}
}

func updateKeyboard(c *koala.Context) {
	if s := session.Store.PeekSession(c.Request, CookieName); s == nil {
		writeErrJSON(c, "请先登录")
	} else {
		if user, ok := s.Get("user").(map[string]interface{}); !ok {
			logger.Error("updateKeyboard in session failed")
			writeErrJSON(c, "更新按键设置失败")
		} else {
			keyboard := make(map[string]int)
			json.Unmarshal([]byte(c.GetBodyQueryString("keyboard")), &keyboard)
			if !dao_user.Update(
				bson.M{
					"name": user["name"],
				}, bson.M{
					"keyboard": keyboard,
				}, nil,
			) {
				logger.Error("updateKeyboard failed")
				writeErrJSON(c, "更新按键设置失败")
				return
			}
			user["keyboard"] = keyboard
			s.Set("user", user)
			writeSuccessJSON(c, "更新按键设置成功", keyboard)
		}
	}
}

func apiKeyboard() {
	app.Get("/api/getKeyboard", getKeyboard)
	app.Post("/api/updateKeyboard", updateKeyboard)
	app.Post("/api/register", register)
}
