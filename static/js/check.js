var check = true;
document.writeln("Checking...<br>");
check &= checkVideo();
check &= checkPeerConnection();
check &= checkGetUserMedia();

var u = navigator.userAgent;
var dest;
if ( u.indexOf('Android') > -1 || u.indexOf('iPhone') > -1 || u.indexOf('iPad') > -1 ) {
    document.writeln("mobile<br>");
    dest = "mobile";
} else {
    document.writeln("PC<br>");
    dest = "PC";
}
if (check) {
    if (dest == "mobile") {
        window.location.href = "p2p.new";
    } else if (dest == "PC") {
        window.location.href = "p2p.new";
    }
} else {
    document.writeln("什么，你还在使用这么腊鸡的浏览器，还不快去下载 chrome / firefox 浏览器<br>");
    document.writeln("如果你想要做一个吃瓜群众，点击<a href='p2p.new'>这里</a>吧，不过要注意你不能进行网络游戏哦<br>");
}

function checkGetUserMedia(){
    getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    if (getUserMedia) {
        document.writeln("Support getUserMedia!<br>");
        return true;
    } else {
        document.writeln("Not support getUserMedia, please try Chrome or Firefox.<br>");
        return false;
    }
}
function checkPeerConnection(){
    PeerConnection = (window.PeerConnection ||
        window.webkitPeerConnection00 ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection);
    if (PeerConnection) {
        document.writeln("Support PeerConnection!<br>");
        return true;
    } else {
        document.writeln("Not support PeerConnection, please try Chrome or Firefox.<br>"); 
        return false;
    }
}
function checkVideo() {  
    if(!!document.createElement('video').canPlayType){  
        var vidTest=document.createElement("video");  
        oggTest=vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');  
        if (!oggTest){  
            h264Test=vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
            if (!h264Test){  
                document.writeln("Not support HTML5 Video, please try Chrome or Firefox.<br>");
                return false;
            }else{  
                if (h264Test=="probably"){  
                    document.writeln("Support HTML5 Video!<br>");  
                    return true;
                }  
                else{  
                    document.writeln("Some support HTML5 Video.<br>");
                    return true;  
                }  
            }  
        }  
        else{  
            if (oggTest=="probably"){  
                document.writeln("Support HTML5 Video!<br>");
                return true;   
            }  
            else{  
                document.writeln("Some support HTML5 Video.<br>"); 
                return true;
            }  
        }  
    }  
    else{  
        document.writeln("Not support HTML5 Video, please try Chrome or Firefox.<br>");
        return false;  
    }  
}