package router

import (
	"time"

	"math/rand"
	"strconv"

	"github.com/MeteorKL/koala"
	"github.com/MeteorKL/koala/util"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"github.com/MeteorKL/nes-online/util/mailer"
	"github.com/MeteorKL/nes-online/util/session"
	"go.mongodb.org/mongo-driver/bson"
)

func generateVerifyCode(mail string) string {
	return util.HashString(strconv.Itoa(rand.Int()) + mail + time.Now().Format("2006-01-02 15:04:05"))
}

func forgetPassword(c *koala.Context) {
	mail := c.GetBodyQueryString("mail")
	exist := existMail(mail)
	if !exist {
		writeErrJSON(c, "该邮箱未注册")
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
	err := mailer.Send(mail, subject, content, "text/html")
	if err != nil {
		writeErrJSON(c, "发送邮件失败，请确认你的邮箱地址后重试")
		return
	}
	writeSuccessJSON(c, "验证邮件发送成功，请注意查收", nil)
}

func resetPassword(c *koala.Context) {
	verifyCode := c.GetBodyQueryString("verify_code")
	mail := c.GetBodyQueryString("mail")
	password := c.GetBodyQueryString("password")

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
		writeErrJSON(c, "重置密码失败")
		return
	}
	writeSuccessJSON(c, "重置密码成功", nil)
}

func changePassword(c *koala.Context) {
	s := session.Store.PeekSession(c.Request, CookieName)
	if s == nil {
		writeErrJSON(c, "你还没有登录")
		return
	}
	if u, ok := s.Get("user").(map[string]interface{}); ok {
		if mail, ok := u["mail"]; ok {
			oldPassword := c.GetBodyQueryString("oldPassword")
			password := c.GetBodyQueryString("password")
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
				writeErrJSON(c, "密码错误")
				return
			}
			writeSuccessJSON(c, "修改密码成功", nil)
			return
		}
	}
	writeErrJSON(c, "你不是通过邮箱注册的")
}

func changeName(c *koala.Context) {
	s := session.Store.PeekSession(c.Request, CookieName)
	if s == nil {
		writeErrJSON(c, "你还没有登录")
		return
	}
	if u, ok := s.Get("user").(map[string]interface{}); ok {
		if oldName, ok := u["name"]; ok {
			name := c.GetBodyQueryString("name")
			if !dao_user.Update(
				bson.M{
					"name": oldName,
				}, bson.M{
					"name":       name,
					"updated_at": time.Now().Unix(),
				},
				nil,
			) {
				writeErrJSON(c, "你的账户不存在？请联系管理员")
				return
			}
			u["name"] = name
			s.Set("user", u)
			writeSuccessJSON(c, "修改昵称成功", u)
			return
		}
	}
	writeErrJSON(c, "该昵称已存在")
}

func apiForgetPassword() {
	app.Post("/api/forgetPassword", forgetPassword)
	app.Post("/api/resetPassword", resetPassword)
	app.Post("/api/changePassword", changePassword)
	app.Post("/api/changeName", changeName)
}
