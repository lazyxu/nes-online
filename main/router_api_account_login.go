package main

import (
	"encoding/json"
	"log"
	"nes-online/koala"
	"net/http"
	"regexp"
	"strings"
	"time"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func login(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	account := k.ParamPost["account"][0]
	password := k.ParamPost["password"][0]
	match, _ := regexp.MatchString(`(\w-*\.*)+@(\w-?)+(\.\w{2,})+`, account)
	Type := ""
	if match {
		Type = "mail"
	} else {
		Type = "name"
	}
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			Type:       account,
			"password": password,
		}).One(&user)
		return user, err
	}) // 没找到也会有错误信息 not found，所以就不判断了
	if len(user) == 0 {
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"msg":   "帐号或密码错误",
		})
		return
	}
	if _, ok := user["active_code"]; ok {
		koala.WriteJSON(w, map[string]interface{}{
			"state": false,
			"msg":   "邮箱尚未激活",
		})
		return
	}
	session := koala.GetSession(r, w, cookieName)
	session.Values["user"] = map[string]interface{}{
		"name":   user["name"],
		"avatar": user["avatar"],
	}
	koala.WriteJSON(w, map[string]interface{}{
		"state": true,
		"msg":   "登录成功",
		"user": map[string]interface{}{
			"name":   user["name"],
			"avatar": user["avatar"],
		},
	})
}

func loginCheck(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	session := koala.PeekSession(r, cookieName)
	log.Println(session)
	if session != nil {
		koala.WriteJSON(w, map[string]interface{}{
			"state": true,
			"user":  session.Values["user"],
		})
		return
	}
	koala.WriteJSON(w, map[string]interface{}{
		"state": false,
	})
}

// loginGithub 根据用户名查看用户公开信息 https://api.github.com/users/meteorkl
func loginGithub(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	res := koala.PostRequest("https://github.com/login/oauth/access_token", map[string]string{
		"client_id":     "2443d910b04cd68c5a66",
		"client_secret": "7612e0862cd87dc2f298aff7051d36561086b939",
		"code":          k.ParamGet["code"][0],
	})
	tokenParam := strings.Split(string(res), "&")[0]
	token := strings.Split(tokenParam, "=")[1]
	jsondata := koala.GetRequest("https://api.github.com/user?access_token=" + token)
	user := make(map[string]interface{})
	err := json.Unmarshal(jsondata, &user)
	if err != nil {
		log.Println(err)
	}
	if user == nil {
		koala.Relocation(w, "/")
		return
	}
	n, err := queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
		n, err := c.Find(map[string]interface{}{
			"github": user["name"],
		}).Count()
		return n, err
	})
	if n == 0 {
		_, err = queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Insert(map[string]interface{}{
				"github":     user["name"],
				"name":       user["name"].(string) + "@github",
				"avatar":     user["avatar"],
				"created_at": time.Now().Unix(),
				"updated_at": time.Now().Unix(),
			})
			return nil, err
		})
		if err != nil {
			log.Println(err)
		}
	} else {
		_, err = queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Update(map[string]interface{}{
				"github": user["name"],
			}, bson.M{
				"$set": bson.M{
					"avatar":     user["avatar"],
					"updated_at": time.Now().Unix(),
				},
			})
			return nil, err
		})
		if err != nil {
			log.Println(err)
		}
	}
	session := koala.GetSession(r, w, "sessionID")
	session.Values["name"] = user["name"]
	session.Values["avatar"] = user["avatar"]
	koala.Relocation(w, "/")
}

func apiLogin() {
	koala.Post("/api/login", login)
	koala.Post("/api/loginCheck", loginCheck)
	koala.Get("/api/loginGithub", loginGithub)
}
