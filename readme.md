# nes online 

try it on http://nes.juanix.cn:8080

js/jsnes https://github.com/bfirsh/jsnes

# 版本变动
## v1.0
成功运行（能运行就不错了对不对）
按下按键时  
本机做出响应
指令传到服务器再传到其他客户端进行相应的响应  

效果感人...

## v1.1
按下按键时  
本机不作出响应
指令传到服务器再传到全部客户端进行相应的响应 

效果依旧感人...

## v1.2
首先客户端与服务器进行时间同步

按下按键时  
本机不作出响应
指令传到服务器，记录客户端时间t
再传到全部客户端约定在t的基础上等待一定的时间（比如最大的ping，或者固定为100ms）进行相应的响应 

然而...不知道为什么还是很容易画面不同步...gg

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
