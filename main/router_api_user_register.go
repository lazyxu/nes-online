package main

import (
	"github.com/MeteorKL/koala"
	"net/http"
	"time"

	"log"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var defaultAvatarURL = "/img/avatar/questionMark.jpg"

// checkMail false表示数据库中有该邮箱...
func checkMail(mail string) (state bool, msg string) {
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			"mail": mail,
		}).One(&user)
		return user, err
	})
	if len(user) == 0 {
		state, msg = true, "该邮箱可用"
	} else if _, ok := user["active_code"]; ok {
		state, msg = true, "邮箱尚未激活，请查看激活邮件或重新注册"
	} else {
		state, msg = false, "该邮箱已经被注册"
	}
	return state, msg
}

func checkName(name string) (state bool, msg string) {
	n, _ := getCountFromCollection("user", func(c *mgo.Collection) (int, error) {
		n, err := c.Find(map[string]interface{}{
			"name": name,
		}).Count()
		return n, err
	})
	if n == 0 {
		state, msg = true, "该昵称可用"
	} else {
		state, msg = false, "该昵称已被使用"
	}
	return state, msg
}

func register(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	name := k.ParamPost["name"][0]
	password := k.ParamPost["password"][0]
	activeCode := koala.HashString(mail + time.Now().Format("2006-01-02 15:04:05"))
	state, msg := checkName(name)
	if !state {
		koala.WriteJSON(w, map[string]interface{}{
			"state": state,
			"msg":   msg,
		})
		return
	}
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			"mail": mail,
		}).One(&user)
		return user, err
	})
	if len(user) == 0 { // 没有被注册过
		_, err := queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Insert(map[string]interface{}{
				"mail":        mail,
				"name":        name,
				"password":    password,
				"active_code": activeCode,
				"avatar":      defaultAvatarURL,
				"created_at":  time.Now().Unix(),
				"updated_at":  time.Now().Unix(),
				"keyboard": map[string]interface{}{
					"up":     87,
					"down":   83,
					"left":   65,
					"right":  68,
					"select": 86,
					"start":  66,
					"A":      75,
					"B":      74,
					"X":      73,
					"Y":      85,
				},
			})
			return nil, err
		})
		if err != nil {
			log.Println(err)
			koala.WriteJSON(w, map[string]interface{}{
				"state": false,
				"msg":   "未知错误",
			})
			return
		}
	} else if _, exist := user["active_code"]; !exist { // 存在该邮箱的帐号，并且已经被激活
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"err":   "该邮箱已经被注册",
		})
		return
	} else { // 存在该邮箱的帐号，但是没有被激活
		queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Update(map[string]interface{}{
				"mail": mail,
			}, bson.M{
				"$set": bson.M{
					"name":        name,
					"password":    password,
					"active_code": activeCode,
					"updated_at":  time.Now().Unix(),
				},
			})
			return nil, err
		})
	}
	url := "http://nes.juanix.cn/#/active/" + activeCode
	subject := "NES游戏平台帐号激活"
	content := "欢迎注册NES游戏平台，请在1h内点击以下链接来激活你的帐号,如果超过时间没有激活就去重新注册趴<br>" +
		"<a href='" + url + "'>" + url + "</a>"
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
		"msg":   "注册邮件发送成功，请在1h内激活你的帐号",
	})
}

func apiRegister() {
	koala.Get("/api/checkMail", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		state, msg := checkMail(k.ParamGet["mail"][0])
		koala.WriteJSON(w, map[string]interface{}{
			"state": state,
			"msg":   msg,
		})
	})
	koala.Get("/api/checkName", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		state, msg := checkName(k.ParamGet["name"][0])
		koala.WriteJSON(w, map[string]interface{}{
			"state": state,
			"msg":   msg,
		})
	})
	koala.Post("/api/register", register)
}
