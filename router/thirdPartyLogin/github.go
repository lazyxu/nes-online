package thirdPartyLogin

import (
	"github.com/MeteorKL/koala/client"
	"strings"
	"encoding/json"
	"github.com/MeteorKL/nes-online/util/config"
	"github.com/MeteorKL/koala/logger"
)

func Github(code string) map[string]interface{} {
	// 1. get access_token
	_, res := client.PostRequest("https://github.com/login/oauth/access_token", map[string]string{
		"client_id":     config.Conf.Github.Client_id,
		"client_secret": config.Conf.Github.Client_secret,
		"code":          code,
	})
	tokenParam := strings.Split(string(res), "&")[0]
	token := strings.Split(tokenParam, "=")[1]
	// 2. get user info
	_, jsondata := client.GetRequest("https://api.github.com/user?access_token=" + token)
	user := make(map[string]interface{})
	err := json.Unmarshal(jsondata, &user)
	logger.Warn(err)
	return user
}