package router

import (
	"net/http"
	"github.com/MeteorKL/koala"

	"net/url"
	"github.com/MeteorKL/koala/util"
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/nes-online/util/constant"
	"github.com/MeteorKL/nes-online/util/dao/dao_user"
	"github.com/MeteorKL/nes-online/util/session"
	"github.com/MeteorKL/nes-online/router/thirdPartyLogin"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/wsRouter"
)

func login(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	account := k.ParamPost["account"][0]
	password := k.ParamPost["password"][0]
	user := dao_user.Login(account, password)
	if len(user) == 0 {
		writeErrJSON(w, "帐号或密码错误")
		return
	}
	if _, ok := user["active_code"]; ok {
		writeErrJSON(w, "邮箱尚未激活")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(w, "您已登录 不能重复登录")
		return
	}
	s := session.Store.GetSession(r, w, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	logger.Debug(s.Get("user"))
	writeSuccessJSON(w, "登录成功", user)
}

func checkLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	s := session.Store.PeekSession(r, CookieName)
	if s == nil {
		writeErrJSON(w, "你还没登录啊")
		return
	}
	writeSuccessJSON(w, "用户已经登录", s.Get("user"))
}

// githubLogin 根据用户名查看用户公开信息 https://api.github.com/users/meteorkl
func githubLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	code := k.ParamGet["code"][0]
	user := thirdPartyLogin.Github(code)
	if user == nil {
		writeErrJSON(w, "获取用户GitHub信息失败")
		return
	}
	user = dao_user.ThirdPartyLogin("github", user["name"].(string), user["avatar_url"].(string))
	if len(user) == 0 {
		writeErrJSON(w, "登录失败")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(w, "您已登录 不能重复登录")
		return
	}
	s := session.Store.GetSession(r, w, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	writeSuccessJSON(w, "登录成功", user)
}

func qqLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	code := k.ParamGet["code"][0]
	redirect_uri := k.ParamGet["redirect_uri"][0]
	user := thirdPartyLogin.QQ(code, redirect_uri)
	if user == nil {
		writeErrJSON(w, "获取用户qq信息失败")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(w, "您已登录 不能重复登录")
		return
	}
	logger.Debug(user)
	s := session.Store.GetSession(r, w, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	writeSuccessJSON(w, "登录成功", user)
}

func qqLoginRedirect(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	URL := "https://graph.qq.com/oauth2.0/authorize?response_type=code"
	URL += "client_id=" + config.Conf.QQ.Appid
	uuid, err := util.UUID()
	if err != nil {
		logger.Error(err)
	}
	URL += "state=" + string(uuid)
	URL += "redirect_uri=" + url.QueryEscape(k.ParamGet["redirect_uri"][0])
	koala.Relocation(w, URL)
}

func visitorLogin(k *koala.Params, w http.ResponseWriter, r *http.Request) {
	name := k.ParamPost["name"][0]
	if !wsRouter.Login(constant.USER_VISITOR, name) {
		writeErrJSON(w, "该昵称已经被使用")
		return
	}
	s := session.Store.GetSession(r, w, CookieName)
	user := make(map[string]interface{})
	user["type"] = constant.USER_VISITOR
	user["name"] = name
	user["avatar"] = constant.DEFAULT_AVATAR_URL
	user["keyboard"] = constant.DEFAULT_KEYBOARD
	s.Set("user", user)
	writeSuccessJSON(w, "登录成功", user)
}

func apiLogin() {
	koala.Post("/api/login", login)
	koala.Post("/api/visitorLogin", visitorLogin)
	koala.Post("/api/checkLogin", checkLogin)
	koala.Get("/api/githubLogin", githubLogin)
	koala.Get("/api/qqLogin", qqLogin)
	koala.Get("/api/qqLoginRedirect", qqLoginRedirect)
	koala.Post("/api/logout", func(k *koala.Params, w http.ResponseWriter, r *http.Request) {
		session.Store.DelSession(r, w, CookieName)
	})
}
