function requestFullScreen(element) {    
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;    
    if (requestMethod) {      
        requestMethod.call(element);    
    } else if (typeof window.ActiveXObject !== "undefined") {      
        var wscript = new ActiveXObject("WScript.Shell");    
        if (wscript !== null) {    
            wscript.SendKeys("{F11}");    
        }    
    }    
}

document.getElementById('stop').onclick = function() {
    if (nes.isRunning) {
        nes.stop();
        document.getElementById('stop').innerHTML = "继续";
    }
    else {
        nes.start();
        document.getElementById('stop').innerHTML = "暂停";
    }
}
document.getElementById('restart').onclick = function() {
    nes.reloadRom();
    nes.start();
}
document.getElementById('sound').onclick = function() {
    if (nes.opts.emulateSound == true) {
        nes.opts.emulateSound = false;
        document.getElementById("video").muted = true;
        document.getElementById('sound').innerHTML = "开启声音";
    } else if (nes.opts.emulateSound == false) {
        nes.opts.emulateSound = true;
        document.getElementById("video").muted = false;
        document.getElementById('sound').innerHTML = "关闭声音";
    }
}
document.getElementById('resize256').onclick = function() {
    nes.ui.screen.animate({width: '256px', height: '240px'});
    var video = document.getElementById("video");
    video.style.width="256px";
    video.style.height="240px";
}
document.getElementById('resize512').onclick = function() {
    nes.ui.screen.animate({width: '512px', height: '480px'});
    var video = document.getElementById("video");
    video.style.width="512px";
    video.style.height="480px";
}
document.getElementById('resize768').onclick = function() {
    nes.ui.screen.animate({width: '768px', height: '720px'});
    var video = document.getElementById("video");
    video.style.width="768px";
    video.style.height="720px";
}
document.getElementById('resize1024').onclick = function() {
    nes.ui.screen.animate({width: '1024px', height: '960px'});
    var video = document.getElementById("video");
    video.style.width="1024px";
    video.style.height="960px";
}
document.getElementById('hide').onclick = function() {
    $('#Chat').css({display: 'none'});$('#Board').css({display: 'none'});
}
document.getElementById('show').onclick = function() {
    $('#Chat').css({display: ''});$('#Board').css({display: ''});
}
document.getElementById('fullScreen').onclick = function() {
    var elem = document.getElementById('canvas'); requestFullScreen(elem);
}