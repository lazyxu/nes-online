package router

import (
	"net/http"
	"time"

	"github.com/MeteorKL/koala"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var defaultAvatarURL = "/img/avatar/questionMark.jpg"

func existMail(mail string) bool {
	n, _ := getCountFromCollection("user", func(c *mgo.Collection) (int, error) {
		return c.Find(bson.M{
			"mail": mail,
		}).Count()
	})
	return n != 0
}

func existName(name string) bool {
	n, _ := getCountFromCollection("user", func(c *mgo.Collection) (int, error) {
		n, err := c.Find(bson.M{
			"name": name,
		}).Count()
		return n, err
	})
	return n != 0
}

func register(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	mail := k.ParamPost["mail"][0]
	name := k.ParamPost["name"][0]
	password := k.ParamPost["password"][0]
	activeCode := generateVerifyCode(mail)
	n, _ := getCountFromCollection("user", func(c *mgo.Collection) (int, error) {
		return c.Find(bson.M{
			"mail": mail,
		}).Count()
	})
	if n == 0 { // 没有被注册过
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
			writeErrJSON(w, err.Error())
			return
		}
	} else {
		writeErrJSON(w, "该邮箱已经被注册或用户昵称已经被使用")
		return
	}
	url := "http://nes.MeteorKL.com/#/active/" + activeCode
	subject := "NES游戏平台帐号激活"
	content := "欢迎注册NES游戏平台，请在1h内点击以下链接来激活你的帐号,如果超过时间没有激活就去重新注册趴<br>" +
		"<a href='" + url + "'>" + url + "</a>"
	err := SendToMail(mail, subject, content, "text/html")
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
