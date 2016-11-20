package main

import (
	"crypto/md5"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
)

func checkErr(err error) {
	if err != nil {
		log.Println(err)
	}
}

func renderHTML(w http.ResponseWriter, file string, data interface{}) {
	t, err := template.New(file).ParseFiles("static/views/" + file)
	checkErr(err)
	t.Execute(w, data)
}

func hashBytes(bytes []byte) string {
	return fmt.Sprintf("%x", md5.Sum(bytes))
}

func hashStrng(s string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(s)))
}

func hashFile(path string) (string, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", md5.Sum(data)), nil
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"version": version}
	renderHTML(w, "index.html", args)
}

func aloneHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"version": version}
	renderHTML(w, "alone.html", args)
}

func p2pHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"Host1": r.Host, "version": version}
	renderHTML(w, "p2p.html", args)
}

func p2pmHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"Host1": r.Host, "version": version}
	renderHTML(w, "p2p.m.html", args)
}

func p2pnewHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"Host1": r.Host, "version": version}
	renderHTML(w, "p2p.new.html", args)
}
func nesHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"Host1": r.Host, "version": version}
	renderHTML(w, "nes.html", args)
}
func csHandler(w http.ResponseWriter, r *http.Request) {
	args := map[string]string{"Host1": r.Host, "version": version}
	renderHTML(w, "cs.html", args)
}

// type Size interface {
// 	Size() int64
// }

// type Stat interface {
// 	Stat() (os.FileInfo, error)
// }

// func uploadHandler(w http.ResponseWriter, r *http.Request) {
// 	if "POST" == r.Method {
// 		r.ParseMultipartForm(32 << 20) // set max cache
// 		if r.MultipartForm != nil && r.MultipartForm.File != nil {
// 			fhs := r.MultipartForm.File["rom"] //获取所有上传文件信息
// 			num := len(fhs)

// 			fmt.Printf("总文件数：%d 个文件\n", num)
// 			//循环对每个文件进行处理
// 			for n, fheader := range fhs {
// 				filename := fheader.Filename

// 				file, err := fheader.Open()
// 				if err != nil {
// 					fmt.Println(err)
// 				}
// 				defer file.Close()

// 				desFile, err := os.OpenFile("upload/"+filename+".nes", os.O_WRONLY|os.O_CREATE, 0666)
// 				if err != nil {
// 					log.Println(err)
// 					return
// 				}
// 				defer desFile.Close()
// 				io.Copy(desFile, file)

// 				fstat, _ := desFile.Stat()
// 				log.Printf("NO.: %d  Size: %d KB  Name：%s\n", n+1, fstat.Size()/1024, filename)
// 			}
// 		}
// 	}
// }

// func bugHandler(w http.ResponseWriter, r *http.Request) {
// 	if "POST" == r.Method {

// 	}
// }

func routerInit() {
	// files
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("static/js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("static/css"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("static/images"))))
	http.Handle("/views/", http.StripPrefix("/views/", http.FileServer(http.Dir("static/views"))))
	http.Handle("/template/", http.StripPrefix("/template/", http.FileServer(http.Dir("static/template"))))
	http.Handle("/roms/", http.StripPrefix("/roms/", http.FileServer(http.Dir("roms"))))

	// website
	// http.HandleFunc("/upload", uploadHandler)
	// http.HandleFunc("/bug", bugHandler)
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/alone", aloneHandler)
	http.HandleFunc("/cs", csHandler)
	http.HandleFunc("/p2p", p2pHandler)
	http.HandleFunc("/p2p.m", p2pmHandler)
	http.HandleFunc("/p2p.new", p2pnewHandler)
	http.HandleFunc("/nes", nesHandler)
	http.HandleFunc("/ws", wsHandler)
}
