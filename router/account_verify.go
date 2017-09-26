package router

import (
	"net/http"
	"time"

	"math/rand"
	"strconv"

	"github.com/MeteorKL/koala"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func generateVerifyCode(mail string) string {
	return koala.HashString(strconv.Itoa(rand.Int()) + mail + time.Now().Format("2006-01-02 15:04:05"))
}

func forgetPassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	exist := existMail(mail)
	if !exist {
		writeErrJSON(w, "该邮箱未注册")
		return
	}
	verifyCode := generateVerifyCode(mail)
	queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
		err := c.Update(map[string]interface{}{
			"mail": mail,
		}, bson.M{
			"$set": bson.M{
				"verify_code": verifyCode,
				"updated_at":  time.Now().Unix(),
			},
		})
		return nil, err
	})
	url := "http://nes.MeteorKL.com/#/resetPassword/" + verifyCode
	subject := "NES游戏平台重置密码"
	content := "请在1h内点击以下链接来重置你的密码<br>" +
		"<a href='" + url + "'>" + url + "</a>"
	err := SendToMail(k.ParamPost["mail"][0], subject, content, "text/html")
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
	_, err := queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
		err := c.Update(map[string]interface{}{
			"mail":        mail,
			"verify_code": verifyCode,
		}, bson.M{
			"$set": bson.M{
				"password":    password,
				"verify_code": generateVerifyCode(mail),
			},
		})
		return nil, err
	})
	if err != nil {
		writeErrJSON(w, "重置密码失败")
		return
	}
	writeSuccessJSON(w, "重置密码成功", nil)
}

func changePassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	oldPassword := k.ParamPost["oldPassword"][0]
	mail := k.ParamPost["mail"][0]
	password := k.ParamPost["password"][0]
	_, err := queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
		err := c.Update(map[string]interface{}{
			"mail":     mail,
			"password": oldPassword,
		}, bson.M{
			"$set": bson.M{
				"password":    password,
				"verify_code": generateVerifyCode(mail),
			},
		})
		return nil, err
	})
	if err != nil {
		writeErrJSON(w, "密码错误")
		return
	}
	writeSuccessJSON(w, "修改密码成功", nil)
}

func apiForgetPassword() {
	koala.Post("/api/forgetPassword", forgetPassword)
	koala.Post("/api/resetPassword", resetPassword)
	koala.Post("/api/changePassword", changePassword)
}
