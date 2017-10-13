package router

import (
	"net/http"
	"time"

	"math/rand"
	"strconv"

	"github.com/MeteorKL/koala/util"
	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/koala"
	"github.com/MeteorKL/nes-online/util/mailer"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
)

func generateVerifyCode(mail string) string {
	return util.HashString(strconv.Itoa(rand.Int()) + mail + time.Now().Format("2006-01-02 15:04:05"))
}

func forgetPassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	exist := existMail(mail)
	if !exist {
		writeErrJSON(w, "该邮箱未注册")
		return
	}
	verifyCode := generateVerifyCode(mail)
	dao_user.Update(
		bson.M{
			"mail": mail,
		}, bson.M{
			"verify_code": verifyCode,
			"updated_at":  time.Now().Unix(),
		},
		nil,
	)
	url := "http://nes.MeteorKL.com/#/resetPassword/" + verifyCode
	subject := "NES游戏平台重置密码"
	content := "请在1h内点击以下链接来重置你的密码<br>" +
		"<a href='" + url + "'>" + url + "</a>"
	err := mailer.Send(k.ParamPost["mail"][0], subject, content, "text/html")
	if err != nil {
		writeErrJSON(w, "发送邮件失败，请确认你的邮箱地址后重试")
		return
	}
	writeSuccessJSON(w, "验证邮件发送成功，请注意查收", nil)
}

func resetPassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	verifyCode := k.ParamPost["verify_code"][0]
	mail := k.ParamPost["mail"][0]
	password := k.ParamPost["password"][0]

	if !dao_user.Update(
		bson.M{
			"mail":        mail,
			"verify_code": verifyCode,
		}, bson.M{
			"password":    password,
			"verify_code": generateVerifyCode(mail),
			"updated_at":  time.Now().Unix(),
		},
		nil,
	) {
		writeErrJSON(w, "重置密码失败")
		return
	}
	writeSuccessJSON(w, "重置密码成功", nil)
}

func changePassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	s := SessionStore.PeekSession(r, CookieName)
	if s == nil {
		writeErrJSON(w, "你还没有登录")
		return
	}
	if u, ok := s.Get("user").(map[string]interface{}); ok {
		if mail, ok := u["mail"]; ok {
			oldPassword := k.ParamPost["oldPassword"][0]
			password := k.ParamPost["password"][0]
			if !dao_user.Update(
				bson.M{
					"mail":     mail,
					"password": oldPassword,
				}, bson.M{
					"password":    password,
					"verify_code": generateVerifyCode(mail.(string)),
					"updated_at":  time.Now().Unix(),
				},
				nil,
			) {
				writeErrJSON(w, "密码错误")
				return
			}
			writeSuccessJSON(w, "修改密码成功", nil)
			return
		}
	}
	writeErrJSON(w, "你不是通过邮箱注册的")
}

func changeName(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	s := SessionStore.PeekSession(r, CookieName)
	if s == nil {
		writeErrJSON(w, "你还没有登录")
		return
	}
	if u, ok := s.Get("user").(map[string]interface{}); ok {
		if oldName, ok := u["name"]; ok {
			name := k.ParamPost["name"][0]
			if !dao_user.Update(
				bson.M{
					"name": oldName,
				}, bson.M{
					"name":       name,
					"updated_at": time.Now().Unix(),
				},
				nil,
			) {
				writeErrJSON(w, "你的账户不存在？请联系管理员")
				return
			}
			u["name"] = name
			s.Set("user", u)
			writeSuccessJSON(w, "修改昵称成功", u)
			return
		}
	}
	writeErrJSON(w, "该昵称已存在")
}

func apiForgetPassword() {
	koala.Post("/api/forgetPassword", forgetPassword)
	koala.Post("/api/resetPassword", resetPassword)
	koala.Post("/api/changePassword", changePassword)
	koala.Post("/api/changeName", changeName)
}
