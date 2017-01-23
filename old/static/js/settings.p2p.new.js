
function init_size(){
    var height = document.documentElement.clientHeight-37;
    var width = document.documentElement.clientWidth;
    // appendChat("浏览器尺寸：" + width + "x" + height);
    var video = document.getElementById("video");
    var emulator = document.getElementById("emulator");
    var landscape = (height>width) ? false : true;
    if (!landscape) {
        nes.ui.screen.animate({width: '0', height: '0'});
        // emulator.style.width = "0px";
        // emulator.style.height = "0px";
        video.style.width = "0px";
        video.style.height = "0px";
        appendChat("请将手机横屏显示");
    } else {
        nes.ui.screen.animate({width: ( height / 240 * 256) + "px", height: height + "px"});
        // emulator.style.width = ( height / 240 * 256) + "px";
        // emulator.style.height = height + "px";
        video.style.width = ( (height+32) / 240 * 256) + "px";
        video.style.height = (height+32) + "px";
        var sysInfo = $("<div>"
        +"<span style='color: red'>[系统]</span>: Thanks to <a target='blank' href='https://github.com/bfirsh/jsnes'>bfirsh's JSNES</a> and <a target='blank' href='https://github.com/InsZVA'>InsZVA</a> <br>"
        +"<span style='color: red'>[系统]</span>: My github is <a target='blank' href='https://github.com/MeteorKL'>https://github.com/MeteorKL</a> <br>"
        +"<span style='color: red'>[系统]</span>: 按键设置默认为 <br>"
        +"<span style='color: red'>[系统]</span>: 上下左右(<span style='color: red'>W S A D</span>) <br>"
        +"<span style='color: red'>[系统]</span>: 选择/确认(<span style='color: red'>V B</span>) <br>"
        +"<span style='color: red'>[系统]</span>: A B(<span style='color: red'>J K</span>) <br>"
        +"<span style='color: red'>[系统]</span>: X Y(<span style='color: red'>U I</span>)<br>"
        +"<span style='color: red'>[系统]</span>: 自定义按键设置请点击右上角的设置按钮 或者 点击<a  data-toggle='modal' data-target='#game_settings-list'>这里</a><br>"
        +"<span style='color: red'>[系统]</span>: 更多说明请点击右上角的帮助按钮(?) 或者 点击<a  data-toggle='modal' data-target='#help-list'>这里</a><br>"
        +"<span style='color: red'>[系统]</span>: 强烈建议在同一网络下进行游戏<br>"
        +"<span style='color: red'>[系统]</span>: 如果你收到的是av画质或者延迟无比巨大一定是因为主机的网络太垃圾，快去吐槽他<br>"
        +"<span style='color: red'>[系统]: v1.5.2更新说明: 加入了保存游戏功能，装载游戏需要先创建该游戏才能起作用</span><br>"
        +"</div>");
        appendSys(sysInfo);
    }
}

window.onresize = function(){
    event.preventDefault();
    var height = document.documentElement.clientHeight-37;
    var width = document.documentElement.clientWidth;
    // appendChat("浏览器尺寸：" + width + "x" + height);
    var video = document.getElementById("video");
    var emulator = document.getElementById("emulator");
    var landscape = (height>width) ? false : true;
    if (!landscape) {
        nes.ui.screen.animate({width: '0', height: '0'});
        // emulator.style.width = "0px";
        // emulator.style.height = "0px";
        video.style.width = "0px";
        video.style.height = "0px";
        var sysInfo = $("<div style='color: red'>"
        +"<span >[系统]: 请将手机横屏显示</span> <br>"
        +"</div>");
        appendSys(sysInfo);
    } else {
        nes.ui.screen.animate({width: ( height / 240 * 256) + "px", height: height + "px"});
        // emulator.style.width = ( height / 240 * 256) + "px";
        // emulator.style.height = height + "px";
        video.style.width = ( (height+32) / 240 * 256) + "px";
        video.style.height = (height+32) + "px";
    }
}