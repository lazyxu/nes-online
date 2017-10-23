package thirdPartyLogin

import (
	"github.com/MeteorKL/koala/client"
	"strings"
	"github.com/MeteorKL/koala/logger"
	"github.com/MeteorKL/nes-online/util/config"
	"encoding/json"
)

func QQ(code string, redirect_uri string)map[string]interface{} {
	// 1. get access_token
	URL := "https://graph.qq.com/oauth2.0/token?grant_type=authorization_code"
	URL += "&client_id=" + config.Conf.QQ.Appid
	URL += "&client_secret=" + config.Conf.QQ.Appkey
	URL += "&code=" + code
	URL += "&redirect_uri=" + redirect_uri
	logger.Debug(code)
	logger.Debug(redirect_uri)
	logger.Debug(config.Conf.QQ.Appid)
	logger.Debug(config.Conf.QQ.Appkey)
	// 2. get user info
	_, _res := client.GetRequest(URL)
	res := string(_res)
	logger.Debug(res)
	if strings.Contains(res, "callback") {
		logger.Error(res)
		return nil
	}
	param := strings.Split(res, "&")[0]
	access_token := strings.Split(param, "=")[0]
	_, _res = client.GetRequest("https://graph.qq.com/oauth2.0/me?access_token=" + access_token)
	res = string(_res)
	param = strings.Split(res, "&")[0]
	openid := strings.Split(param, "=")[1]
	URL = "https://graph.qq.com/user/get_user_info?"
	URL += "&access_token=" + access_token
	URL += "&oauth_consumer_key=" + config.Conf.QQ.Appid
	URL += "&openid=" + openid
	_, jsondata := client.GetRequest(URL)
	user := make(map[string]interface{})
	err := json.Unmarshal(jsondata, &user)
	logger.Warn(err)
	return user
}