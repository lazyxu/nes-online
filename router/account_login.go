package router

import (
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

func login(c *koala.Context) {
	account := c.GetBodyQueryString("account")
	password := c.GetBodyQueryString("password")
	user := dao_user.Login(account, password)
	if len(user) == 0 {
		writeErrJSON(c, "帐号或密码错误")
		return
	}
	if _, ok := user["active_code"]; ok {
		writeErrJSON(c, "邮箱尚未激活")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(c, "您已登录 不能重复登录")
		return
	}
	s := session.Store.GetSession(c.Request, c.Writer, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	logger.Debug(s.Get("user"))
	writeSuccessJSON(c, "登录成功", user)
}

func checkLogin(c *koala.Context) {
	s := session.Store.PeekSession(c.Request, CookieName)
	if s == nil {
		writeErrJSON(c, "你还没登录啊")
		return
	}
	writeSuccessJSON(c, "用户已经登录", s.Get("user"))
}

// githubLogin 根据用户名查看用户公开信息 https://api.github.com/users/meteorkl
func githubLogin(c *koala.Context) {
	code := c.GetQueryString("code")
	user := thirdPartyLogin.Github(code)
	if user == nil {
		writeErrJSON(c, "获取用户GitHub信息失败")
		return
	}
	user = dao_user.ThirdPartyLogin("github", user["name"].(string), user["avatar_url"].(string))
	if len(user) == 0 {
		writeErrJSON(c, "登录失败")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(c, "您已登录 不能重复登录")
		return
	}
	s := session.Store.GetSession(c.Request, c.Writer, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	writeSuccessJSON(c, "登录成功", user)
}

func qqLogin(c *koala.Context) {
	code := c.GetQueryString("code")
	redirect_uri := c.GetQueryString("redirect_uri")
	user := thirdPartyLogin.QQ(code, redirect_uri)
	if user == nil {
		writeErrJSON(c, "获取用户qq信息失败")
		return
	}
	if !wsRouter.Login(constant.USER_LOGIN, user["name"].(string)) {
		writeErrJSON(c, "您已登录 不能重复登录")
		return
	}
	logger.Debug(user)
	s := session.Store.GetSession(c.Request, c.Writer, CookieName)
	user["type"] = constant.USER_LOGIN
	s.Set("user", user)
	writeSuccessJSON(c, "登录成功", user)
}

func qqLoginRedirect(c *koala.Context) {
	URL := "https://graph.qq.com/oauth2.0/authorize?response_type=code"
	URL += "client_id=" + config.Conf.QQ.Appid
	uuid, err := util.UUID()
	if err != nil {
		logger.Error(err)
	}
	URL += "state=" + string(uuid)
	URL += "redirect_uri=" + url.QueryEscape(c.GetQueryString("redirect_uri"))
	c.Relocation(URL)
}

func visitorLogin(c *koala.Context) {
	name := c.GetBodyQueryString("name")
	if !wsRouter.Login(constant.USER_VISITOR, name) {
		writeErrJSON(c, "该昵称已经被使用")
		return
	}
	s := session.Store.GetSession(c.Request, c.Writer, CookieName)
	user := make(map[string]interface{})
	user["type"] = constant.USER_VISITOR
	user["name"] = name
	user["avatar"] = constant.DEFAULT_AVATAR_URL
	user["keyboard"] = constant.DEFAULT_KEYBOARD
	s.Set("user", user)
	writeSuccessJSON(c, "登录成功", user)
}

func apiLogin() {
	app.Post("/api/login", login)
	app.Post("/api/visitorLogin", visitorLogin)
	app.Post("/api/checkLogin", checkLogin)
	app.Get("/api/githubLogin", githubLogin)
	app.Get("/api/qqLogin", qqLogin)
	app.Get("/api/qqLoginRedirect", qqLoginRedirect)
	app.Post("/api/logout", func(c *koala.Context) {
		session.Store.DelSession(c.Request, c.Writer, CookieName)
	})
}
