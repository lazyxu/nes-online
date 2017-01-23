package main

import (
	"fmt"
	"os"
)

func deleteRom(m map[string]interface{}) {
	filePath := m["filePath"].(string)
	err := os.Remove(filePath)
	if err != nil {
		fmt.Println("file " + filePath + "remove Error!")
		fmt.Printf("%s", err)
	} else {
		fmt.Print("file remove OK!")
	}
}

// func saveRom(m map[string]interface{}) {
// 	fileBytes := m["ROM"].([]byte)
// 	ip := m["IP"].(string)
// 	name := m["Name"].(string)
// 	filePath := "upload/" + ip + " - " + name + hashBytes(fileBytes) + ".nes"
// 	destFile, err := os.Create(filePath)
// 	if err != nil {
// 		fmt.Println(err.Error())
// 		return
// 	}
// 	defer destFile.Close()
// 	destFile.Write(fileBytes)
// }
func screenShot(m map[string]interface{}) {

}
