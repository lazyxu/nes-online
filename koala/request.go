package koala

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
)

func GetRequest(URL string) []byte {
	fmt.Println("GetRequest:", URL)
	resp, err := http.Get(URL)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	fmt.Println("resp:", resp)
	body, err := ioutil.ReadAll(resp.Body)
	fmt.Println("body:", body)
	resp.Body.Close()
	if err != nil {
		// handle error
		return nil
	}
	fmt.Println(string(body), err)
	return body
}

func PostRequest(URL string, param map[string]string) []byte {
	fmt.Println("PostRequest:", URL)
	query := url.Values{}
	for k, v := range param {
		query.Set(k, v)
	}
	resp, err := http.PostForm(URL, query)
	if err != nil {
		// handle error
	}
	body, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		// handle error
	}
	fmt.Println(string(body))
	return body
}
