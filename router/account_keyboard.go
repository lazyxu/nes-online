package router

import (
	"encoding/json"
	"github.com/MeteorKL/koala"
	"net/http"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/session"
)

func getKeyboard(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	if s := session.Store.PeekSession(r, CookieName); s == nil {
		writeErrJSON(w, "请先登录")
	} else {
		if user, ok := s.Get("user").(map[string]interface{}); ok {
			writeSuccessJSON(w, "获取按键设置成功",user["keyboard"])
		} else {
			logger.Error("updateKeyboard in session failed")
			writeErrJSON(w, "获取按键设置失败")
		}
	}
}

func updateKeyboard(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	if s := session.Store.PeekSession(r, CookieName); s == nil {
		writeErrJSON(w, "请先登录")
	} else {
		if user, ok := s.Get("user").(map[string]interface{}); !ok {
			logger.Error("updateKeyboard in session failed")
			writeErrJSON(w, "更新按键设置失败")
		} else {
			keyboard := make(map[string]int)
			json.Unmarshal([]byte(k.ParamPost["keyboard"][0]), &keyboard)
			if !dao_user.Update(
				bson.M{
					"name": user["name"],
				}, bson.M{
					"keyboard": keyboard,
				}, nil,
			) {
				logger.Error("updateKeyboard failed")
				writeErrJSON(w, "更新按键设置失败")
				return
			}
			user["keyboard"] = keyboard
			s.Set("user", user)
			writeSuccessJSON(w, "更新按键设置成功", keyboard)
		}
	}
}

func apiKeyboard() {
	koala.Get("/api/getKeyboard", getKeyboard)
	koala.Post("/api/updateKeyboard", updateKeyboard)
	koala.Post("/api/register", register)
}
