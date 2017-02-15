package koala

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// ReadJSONFile 读取放在文件中的json数据
func ReadJSONFile(filename string) (map[string]string, error) {
	var data = map[string]string{}
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println("ReadFile: ", err.Error())
		return nil, err
	}
	if err := json.Unmarshal(bytes, &data); err != nil {
		fmt.Println("Unmarshal: ", err.Error())
		return nil, err
	}
	return data, nil
}
