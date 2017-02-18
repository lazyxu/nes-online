package main

import (
	"log"
	"nes-online/koala"
	"net/http"
	"time"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func forgetPassword(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	state, msg := checkMail(mail)
	log.Println(mail, state, msg)
	if state {
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"msg":   "该邮箱未注册或者未激活",
		})
		return
	}
	verifyCode := koala.HashString(mail + time.Now().Format("2006-01-02 15:04:05"))
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
	url := "http://nes.juanix.cn/#/forgetPassword/reset/" + verifyCode
	subject := "NES游戏平台重置密码"
	content := "请在1h内点击以下链接来重置你的密码<br>" +
		"<a href='" + url + "'>" + url + "</a>"
	log.Println(mail)
	err := SendToMail(k.ParamPost["mail"][0], subject, content, "text/html")
	if err != nil {
		log.Println(err)
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"msg":   "发送邮件失败，请确认你的邮箱地址后重试",
		})
		return
	}
	koala.WriteJSON(w, map[string]interface{}{
		"state": true,
		"msg":   "验证邮件发送成功，请注意查收",
	})
}

func apiForgetPassword() {
	koala.Post("/api/forgetPassword", forgetPassword)
}
