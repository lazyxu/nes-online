package router

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/MeteorKL/koala"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"github.com/MeteorKL/koala/session"
	"log"
	"net/url"
)

const USER_UNLOGIN = -1
const USER_VISITOR = 0
const USER_LOGIN = 1
const USER_MAX = 2

var userNames = make(map[string]bool)

var SessionStore = session.NewSessionStore(session.DEFAULT_EXPIRE_TIME)

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
	s := SessionStore.GetSession(r, w, CookieName)
	user["type"] = USER_LOGIN
	s.Set("user", user)
	log.Println(s.Get("user"))
	writeSuccessJSON(w, "登录成功", user)
}

func checkLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	s := SessionStore.PeekSession(r, CookieName)
	if s == nil {
		writeErrJSON(w, "你还没登录啊")
		return
	}
	writeSuccessJSON(w, "用户已经登录", s.Get("user"))
}

// loginGithub 根据用户名查看用户公开信息 https://api.github.com/users/meteorkl
func loginGithub(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	_, res := koala.PostRequest("https://github.com/login/oauth/access_token", map[string]string{
		"client_id":     config.Github.Client_id,
		"client_secret": config.Github.Client_secret,
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
				"keyboard":   DEFAULT_KEYBOARD,
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
	s := SessionStore.GetSession(r, w, CookieName)
	user["type"] = USER_LOGIN
	s.Set("user", user)
	writeSuccessJSON(w, "登录成功", user)
}

func loginQQ(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	URL := "https://graph.qq.com/oauth2.0/token?grant_type=authorization_code"
	URL += "&client_id=" + config.QQ.Appid
	URL += "&client_secret=" + config.QQ.Appkey
	URL += "&code=" + k.ParamGet["code"][0]
	URL += "&redirect_uri=" + k.ParamGet["redirect_uri"][0]
	log.Println(k.ParamGet["code"][0])
	log.Println(k.ParamGet["redirect_uri"][0])
	log.Println(config.QQ.Appid)
	log.Println(config.QQ.Appkey)
	_, _res := koala.GetRequest(URL)
	res := string(_res)
	log.Println(res)
	if strings.Contains(res, "callback") {
		w.Write([]byte("抱歉，当前存在网络问题或服务器繁忙，详细错误：+"+res+" 请稍后再试，谢谢。"))
	}
	param := strings.Split(res, "&")[0]
	access_token := strings.Split(param, "=")[0]
	_, _res = koala.GetRequest("https://graph.qq.com/oauth2.0/me?access_token=" + access_token)
	res = string(_res)
	param = strings.Split(res, "&")[0]
	openid := strings.Split(param, "=")[1]
	URL = "https://graph.qq.com/user/get_user_info?"
	URL+="&access_token="+access_token
	URL+="&oauth_consumer_key="+config.QQ.Appid
	URL+="&openid="+openid
	_, jsondata := koala.GetRequest(URL)
	user := make(map[string]interface{})
	err := json.Unmarshal(jsondata, &user)
	if err != nil || user == nil {
		writeErrJSON(w, "获取用户qq信息失败")
		return
	}
  	log.Println(user)
}

func qqLoginRedirect(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	redirect_uri := url.QueryEscape("http://nes.meteorkl.com")
	koala.Relocation(w, "https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101428613&state=666&redirect_uri="+redirect_uri)
}

func visitorLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	name := k.ParamPost["name"][0]
	if _, exist := userNames[name]; exist {
		writeErrJSON(w, "该昵称已经被使用")
		return
	}
	userNames[name] = true
	s := SessionStore.GetSession(r, w, CookieName)
	user := make(map[string]interface{})
	user["name"] = name
	user["avatar"] = DEFAULT_AVATAR_URL
	user["type"] = USER_VISITOR
	s.Set("user", user)
	writeSuccessJSON(w, "登录成功", user)
}

func apiLogin() {
	koala.Post("/api/login", login)
	koala.Post("/api/visitorLogin", visitorLogin)
	koala.Post("/api/checkLogin", checkLogin)
	koala.Get("/api/loginGithub", loginGithub)
	koala.Get("/api/loginQQ", loginQQ)
	koala.Get("/api/qqLoginRedirect", qqLoginRedirect)
	koala.Post("/api/logout", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		SessionStore.DelSession(r, w, CookieName)
	})
}
