
function init_size(){
    var height = document.documentElement.clientHeight-37;
    var width = document.documentElement.clientWidth;
    appendChat("浏览器尺寸：" + width + "x" + height);
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
        appendChat("按键设置默认为 上下左右(wsad) 选择/确认(vb) A/B(jk)");
    }
}

window.onresize = function(){
    event.preventDefault();
    var height = document.documentElement.clientHeight-37;
    var width = document.documentElement.clientWidth;
    appendChat("浏览器尺寸：" + width + "x" + height);
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
    }
}