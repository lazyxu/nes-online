package router

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/MeteorKL/koala"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func login(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	account := k.ParamPost["account"][0]
	password := k.ParamPost["password"][0]
	match, _ := regexp.MatchString(`(\w-*\.*)+@(\w-?)+(\.\w{2,})+`, account)
	accountType := ""
	if match {
		accountType = "mail"
	} else {
		accountType = "name"
	}
	user, _ := selectFromCollection("user", func(c *mgo.Collection) (map[string]interface{}, error) {
		user := make(map[string]interface{})
		err := c.Find(map[string]interface{}{
			accountType: account,
			"password":  password,
		}).Select(bson.M{"password": 0}).One(&user)
		return user, err
	}) // 没找到也会有错误信息 not found，所以就不判断了
	if len(user) == 0 {
		writeErrJSON(w, "帐号或密码错误")
		return
	}
	if _, ok := user["active_code"]; ok {
		writeErrJSON(w, "邮箱尚未激活")
		return
	}
	session := koala.GetSession(r, w, CookieName)
	session.Values["user"] = user
	writeSuccessJSON(w, "登录成功", user)
}

func checkLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	session := koala.PeekSession(r, CookieName)
	if session != nil {
		writeSuccessJSON(w, "用户已经登录", session.Values["user"])
		return
	}
	writeErrJSON(w, "你还没登录啊")
}

var clientInfo map[string]string

// loginGithub 根据用户名查看用户公开信息 https://api.github.com/users/meteorkl
func loginGithub(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	if clientInfo == nil {
		var err error
		clientInfo, err = koala.ReadJSONFile("util_github.json")
		if err != nil {
			writeErrJSON(w, "读取配置信息失败，请联系管理员")
			return
		}
	}
	_, res := koala.PostRequest("https://github.com/login/oauth/access_token", map[string]string{
		"client_id":     clientInfo["client_id"],
		"client_secret": clientInfo["client_secret"],
		"code":          k.ParamGet["code"][0],
	})
	tokenParam := strings.Split(string(res), "&")[0]
	token := strings.Split(tokenParam, "=")[1]
	_, jsondata := koala.GetRequest("https://api.github.com/user?access_token=" + token)
	user := make(map[string]interface{})
	err := json.Unmarshal(jsondata, &user)
	if err != nil || user == nil {
		writeErrJSON(w, "获取用户GitHub信息失败")
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
				"avatar":     user["avatar_url"],
				"created_at": time.Now().Unix(),
				"updated_at": time.Now().Unix(),
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
			writeErrJSON(w, "注册用户GitHub信息失败")
			return
		}
	} else {
		_, err = queryInCollection("user", func(c *mgo.Collection) (interface{}, error) {
			err := c.Update(map[string]interface{}{
				"github": user["name"],
			}, bson.M{
				"$set": bson.M{
					"avatar":     user["avatar_url"],
					"updated_at": time.Now().Unix(),
				},
			})
			return nil, err
		})
		if err != nil {
			writeErrJSON(w, "更新用户GitHub信息失败")
			return
		}
	}
	session := koala.GetSession(r, w, CookieName)
	session.Values["user"] = user
	koala.Relocation(w, "/")
}

func apiLogin() {
	koala.Post("/api/login", login)
	koala.Post("/api/checkLogin", checkLogin)
	koala.Get("/api/loginGithub", loginGithub)
	koala.Post("/api/logout", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		koala.DestorySession(r, w, CookieName)
	})
}