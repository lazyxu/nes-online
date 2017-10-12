package router

type ConfigModel struct {
	Github struct {
		Client_id     string `json:"client_id"`
		Client_secret string `json:"client_secret"`
	}
	QQ struct {
		Appid  string `json:"appid"`
		Appkey string
	}
	Mail struct {
		User     string `json:"user"`
		Password string `json:"password"`
		Host     string `json:"host"`
		Port     int `json:"port"`
	}
	Mgo struct {
		Addrs      []string `json:"addrs"`
		Username  string `json:"username"`
		Password  string `json:"password"`
		Database  string `json:"database"`
		Source    string `json:"source"`
		Mechanism string `json:"mechanism"`
	}
}

var config ConfigModel
