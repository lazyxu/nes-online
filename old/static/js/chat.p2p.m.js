var conn;
var msg = $("#msg");
var ChatContent = $("#info");
var rooms = $("#rooms");
var logID = 0;
var ip;
function appendLog(msg) {
    var d = ChatContent[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div id='log"+logID+"'/>").text(msg).appendTo(ChatContent);
    logID++;
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
    if (logID > 10) {
        var templogID = logID - 11;
        removeDiv("log"+templogID);
    }
}
function appendRoom(msg) {
    var d = rooms[0];
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    msg.appendTo(rooms)
    if (doScroll) {
    d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}
function removeDiv(id) {
    var d = document.getElementById(id)
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    d.remove()
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}
function joinPair(roomName){
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "joinPair", "roomName": roomName}));
}

function readyPair(){
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({
        "opt": "readyPair", 
        "KEY_UP":$('#KEY_UP').val(),
        "KEY_DOWN":$('#KEY_DOWN').val(),
        "KEY_LEFT":$('#KEY_LEFT').val(),
        "KEY_RIGHT":$('#KEY_RIGHT').val(),
        "KEY_SELECT":$('#KEY_SELECT').val(),
        "KEY_START":$('#KEY_START').val(),
        "KEY_A":$('#KEY_A').val(),
        "KEY_B":$('#KEY_B').val(),
    }));
}
$("#form").submit(function() {
    if (!conn) {
        return false;
    }
    if (!msg.val()) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "msg", "data": msg.val()}));
    msg.val("");
    return false
});

var PeerConnection, pc;
var videoElement = document.getElementById("video");
var dataChannel, receiveChannel;
var dynamicaudio = new DynamicAudio();
function prepare() {
    PeerConnection = (window.PeerConnection ||
    window.webkitPeerConnection00 ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection);

    pc = new PeerConnection({"iceServers": []});
    //发送ICE候选到其他客户端
    pc.onicecandidate = function(event){
        conn.send(JSON.stringify({
            "opt": "__ice_candidate",
            "candidate": event.candidate
        }));
    };
    var dataChannelOptions = {
        ordered:false,
        maxRetransmitTime: 3000
    }
    dataChannel = pc.createDataChannel("button", dataChannelOptions);
    dataChannel.onopen = function(event) {
        appendLog("dataChannel start");
    }
    dataChannel.onmessage = function(event) {
        appendLog("dataChannel message");
    }
    dataChannel.onclose = function(event) {
        appendLog("dataChannel closed");
    }
    
var audioContext = new AudioContext();
    pc.ondatachannel = function(event) {
        receiveChannel = event.channel;
        receiveChannel.onopen = function(event) {
            appendLog("receiveChannel start");
        }
        receiveChannel.onmessage = function(event) {
            dynamicaudio.writeInt(event.data.split(","));
        }
        receiveChannel.onclose = function(event) {
            appendLog("receiveChannel closed");
        }
    }
    //如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    pc.onaddstream = function(event){
        videoElement.src = URL.createObjectURL(event.stream);
    };
}

if (window["WebSocket"]) {
    conn = new WebSocket("ws://"+$('#host')[0].innerHTML+"/ws");
    conn.onclose = function(evt) {
        appendLog("与服务器断开连接");
    }
    conn.onmessage = function(evt) {
        var jsonData=JSON.parse(evt.data);
        // appendLog(jsonData.opt+": "+jsonData.data));
        switch(jsonData.opt) 
        { 
            case "msg":
                appendLog(jsonData.data);
                break; 
            case "listRooms":
                appendRoom($("<div id="+jsonData.roomName+" onclick=\"joinPair('"+jsonData.roomName+"')\"/>").text(jsonData.ip+' - ' + jsonData.data));
                break;  
            case "in": 
                appendLog(jsonData.data+"来到了平台");
                break; 
            case "ip":
                ip = jsonData.data;
                $('#ip').text(" "+jsonData.data);
                break; 
            case "readyPair":
                appendLog("玩家"+jsonData.no+" "+jsonData.ip+"已经准备好了");
                break; 
            case "leavePair":
                if (jsonData.empty=="true") {
                    if (document.getElementById(jsonData.roomName)) {
                        removeDiv(jsonData.roomName);
                    }
                }
                appendLog(jsonData.ip+"离开了双人房"+jsonData.roomName);
                break; 
            case "createPair":
                appendRoom($("<div id="+jsonData.roomName+" onclick=\"joinPair('"+jsonData.roomName+"')\"/>").text(jsonData.ip+' - ' + jsonData.data));
                appendLog(jsonData.ip+"创建了游戏"+jsonData.data);
                break; 
            case "joinPair":
                if (ip == jsonData.ip) {
                    readyPair();
                }
                appendLog(jsonData.ip+"进入了双人房"+jsonData.roomName);
                break;
            case "startPair":
                appendLog("正在建立p2p连接...");
                prepare();
                function touches(ev){ 
                    if(ev.touches.length==1){ 
                        var oDiv=document.getElementById('div1'); 
                        switch(ev.type){ 
                            case 'touchstart': 
                                oDiv.innerHTML='Touch start('+ev.touches[0].clientX+', '+ev.touches[0].clientY+')'; 
                                ev.preventDefault();  //阻止出现滚动条 
                                break; 
                            case 'touchend': 
                                oDiv.innerHTML='Touch end('+ev.changedTouches[0].clientX+', '+ev.changedTouches[0].clientY+')'; 
                                break; 
                            case 'touchmove': 
                                oDiv.innerHTML='Touch move('+ev.changedTouches[0].clientX+', '+ev.changedTouches[0].clientY+')'; 
                                break; 
                        } 
                    } 
                } 
                document.getElementById('KEY_A').addEventListener('touchstart',touches,false); 
                document.getElementById('KEY_A').onclick = function() {
                    dataChannel.send(JSON.stringify({"keyCode": Number($('#KEY_A').val()), "value": 65}));
                    dataChannel.send(JSON.stringify({"keyCode": Number($('#KEY_A').val()), "value": 64}));
                }
                break;
            case "__ice_candidate":
                appendLog("__ice_candidate");
                var mid = new RTCIceCandidate(jsonData.candidate);
                pc.addIceCandidate(mid);
                break;
            case "__offer":
                appendLog("receive __offer");
                var mid = new RTCSessionDescription(jsonData.sdp);
                pc.setRemoteDescription(mid);
                
                pc.createAnswer().then(function(answer) {
                    return pc.setLocalDescription(answer);
                }).then(function() {
                    conn.send(JSON.stringify({
                        "opt": "__answer",
                        "sdp": pc.localDescription
                    }));
                });
                appendLog("send __answer");
                break;
            case "__answer":
                appendLog("receive __answer");
                var mid = new RTCSessionDescription(jsonData.sdp);
                pc.setRemoteDescription(mid);
                break;
            default: 
                // appendLog(jsonData.data));
                break;
        } 
    }
} else {
    appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
}
