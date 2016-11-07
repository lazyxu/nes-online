# nes online
http://nes.juanix.cn:8080  
/p2p p2p传视频传指令方式  
/alone 单机模式，可以双人玩  
  
运行 go run *.go  
编译 go build -o main *.go  
  
# 版本变动
## v1.3.2.1  
完善了聊天界面的放大和缩小功能  
删除多余的测试文件和测试输出  
声音方案：  
1.用webRTC的dataChannel来传递buffer，再转化成声音输出，网络差的时候卡顿比较明显  
2.用webRTC的getUserMedia来传输，需要https，带耳机时无法传输游戏声音  

## v1.3.1  
用webRTC的dataChannel来p2p传递按键信息  

## v1.3 局域网版本  
消息结构变为send chan map[string]interface{}  
自乐大王说可以用webRTC技术传输视频，局域网内效果显著，校园网内看人品  
/alone 单机模式，可以双人玩  
/p2p p2p传视频传指令方式  
  
## v1.2.2
fps并不能很好的固定下来，setInterval也是有误差的  
canvas.toDataURL()保存为图片的方法也不行  
好像没找到什么好的解决办法，暂时不搞了...  
  
## v1.2.1
讲道理时间控制应该没错啊  
虽然应该多次测取平均值  
但是大概应该没错的啊  
  
听说settimeout这个函数很不准，换成了setInterval  
本来以为会因为发消息太频繁有按键消息丢了，还想每隔50ms发一次  
但是本机测试并没有...  
实测这游戏fps不同游戏运行速度不同，可能是这个原因？？？  
  
## v1.2
首先客户端与服务器进行时间同步  
  
按下按键时    
本机不作出响应  
指令传到服务器，记录客户端时间t  
再传到全部客户端约定在t的基础上等待一定的时间（比如最大的ping，或者固定为100ms）进行相应的响应  
  
然而...不知道为什么还是很容易画面不同步...gg  
  
## v1.1
按下按键时   
本机不作出响应   
指令传到服务器再传到全部客户端进行相应的响应   
  
效果依旧感人...  
  
## v1.0
成功运行（能运行就不错了对不对） 
按下按键时   
本机做出响应  
指令传到服务器再传到其他客户端进行相应的响应   
  
效果感人...  
  
# Thanks to
Inszva: http://blog.csdn.net/inszva/article/details/52840393  
JSNES: https://github.com/bfirsh/jsnes  
  
虚拟按键支持: http://joemeeks.net/tt17/  
gamepad支持: https://github.com/josephlewis42/jsnes  
  
# License
JSNES, based on Jamie Sanders' vNES  
Copyright (C) 2010 Ben Firshman  
  
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.  
  
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.  
  
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.  
  