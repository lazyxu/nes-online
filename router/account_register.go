package router

import (
	"net/http"
	"time"

	"github.com/MeteorKL/koala"

	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"github.com/MeteorKL/nes-online/util/constant"
	"github.com/MeteorKL/nes-online/util/mailer"
)

func existMail(mail string) bool {
	return dao_user.Exist(
		bson.M{
			"mail": mail,
		},
	)
}

func existName(name string) bool {
	return dao_user.Exist(
		bson.M{
			"name": name,
		},
	)
}

func register(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	name := k.ParamPost["name"][0]
	password := k.ParamPost["password"][0]
	activeCode := generateVerifyCode(mail)
	now := time.Now().Unix()
	if !dao_user.Insert(bson.M{
		"mail":        mail,
		"name":        name,
		"password":    password,
		"active_code": activeCode,
		"avatar":      constant.DEFAULT_AVATAR_URL,
		"created_at":  now,
		"updated_at":  now,
		"keyboard":    constant.DEFAULT_KEYBOARD,
	}) {
		writeErrJSON(w, "发生未知错误，请联系管理员")
		return
	}

	url := "http://nes.MeteorKL.com/#/active/" + activeCode
	subject := "NES游戏平台帐号激活"
	content := "欢迎注册NES游戏平台，请在1h内点击以下链接来激活你的帐号,如果超过时间没有激活就去重新注册趴<br>" +
		"<a href='" + url + "'>" + url + "</a>"
	err := mailer.Send(mail, subject, content, "text/html")
	if err != nil {
		println(err.Error())
		writeErrJSON(w, "发送邮件失败，请确认你的邮箱地址后重试")
		return
	}
	writeSuccessJSON(w, "注册邮件发送成功，请在1h内激活你的帐号", nil)
}

func apiRegister() {
	koala.Get("/api/checkMail", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		exist := existMail(k.ParamGet["mail"][0])
		if exist {
			writeErrJSON(w, "该邮箱已经被注册")
			return
		}
		writeSuccessJSON(w, "该邮箱可用", nil)
	})
	koala.Get("/api/checkName", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		exist := existName(k.ParamGet["name"][0])
		if exist {
			writeErrJSON(w, "该昵称已被使用")
			return
		}
		writeSuccessJSON(w, "该昵称可用", nil)
	})
	koala.Post("/api/register", register)
}
