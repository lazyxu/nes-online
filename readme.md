# NES Online
<img src="images/screenshot.png" width="100%"/>

# logs 
* 以前的logs位于old_logs.md
* 现在前端用react和redux重写

## far future
* 修改密码，修改头像
* 共享操作（离开房间自动开启）
* 保存游戏至服务器，装载游戏
* 添加好友，显示好友状态，邀请好友
* 支持保存录像和播放录像
* 允许创建本地rom并上传
* 资源的分步加载

## before release
* 游戏中按键更改后通知其他玩家
* 忘记密码功能

* 如果可能的话，按键消息用 webRTC 传
* 将窗口组件抽象话，最好能达到像滚动条一样的复用

## v0.3.0
* 游戏设置的功能实现
* 登录界面背景图片修改
* 现在基本可以玩啦
* 发现某些时候还是不同步，尴尬...

## v0.2.3
* 修复单人模式不能开始游戏
* 增加连发按键
* 画了一下游戏设置的界面

## v0.2.2
* keyboardAction 改为优先队列
* 联机测试初步成功

## v0.2.1
* 把原来所有指令全部存下来导致数组不断增大的懒惰办法改成只存预定的延迟帧数

## v0.2.0
* 本地完全同步666

## v0.1.2
* 界面做的差不多了，单人模式可以玩了，按键设置可以同步到服务器了

## v0.1.0
* 第一个可以重用的组件 滚动条

## v0.0.1
* 打算做成单页面应用，后端做成api的形式，
* 初步学习了react和redux的用法，感官不错，减少了复制粘贴的部分，
而且界面分割，事件绑定，状态管理等都比裸奔好了无数倍，
但是...我写的代码依旧很糟糕...

# reference
* react: https://facebook.github.io/react/docs/installation.html
* redux: http://cn.redux.js.org/index.html
* JSNES: https://github.com/bfirsh/jsnes
* webRTC: http://blog.csdn.net/inszva/article/details/52840393
* localStorage & Gamepad: https://github.com/josephlewis42/jsnes
* Gamepad: https://github.com/alaingilbert/GamepadJs
* UI: Nostalgia.NES

# contact me
* mail: nes@juanix.cn