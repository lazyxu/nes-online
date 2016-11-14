window.onload = function() {
    var height = document.documentElement.clientHeight;
    var width = document.documentElement.clientWidth;
    appendLog("重要的事情说三遍");
    appendLog("手机端还在开发中，可能还不能玩！！！");
    appendLog("手机端还在开发中，可能还不能玩！！！");
    appendLog("手机端还在开发中，可能还不能玩！！！");
    appendLog("手机只支持加入房间，并且需要在wifi模式下登录！");
    appendLog("浏览器尺寸：" + width + "x" + height);
    var video = document.getElementById("video");
    var landscape = (height>width) ? false : true;
    if (!landscape) {
        video.style.width = "0px";
        video.style.height = "0px";
        appendLog("请将手机横屏显示");
    } else {
        video.style.width = ( (height - 5) / 240 * 256) + "px";
        video.style.height = (height - 5) + "px";
        appendLog("video尺寸：" + video.style.width + " " + video.style.height);
    }
}

window.onresize = function(){
    var height = document.documentElement.clientHeight;
    var width = document.documentElement.clientWidth;
    appendLog("浏览器尺寸：" + width + "x" + height);
    var video = document.getElementById("video");
    var landscape = (height>width) ? false : true;
    if (!landscape) {
        video.style.width = "0px";
        video.style.height = "0px";
        appendLog("请将手机横屏显示");
    } else {
        video.style.width = ( (height - 5) / 240 * 256) + "px";
        video.style.height = (height - 5) + "px";
        appendLog("video尺寸：" + video.style.width + " " + video.style.height);
    }
}