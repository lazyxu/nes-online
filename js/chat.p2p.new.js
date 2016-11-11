var conn;
var msg = $("#msg");
var Chat = $("#info");
var roomChat = $("#room_chat");
var users = $("#users");
var rooms = $("#rooms");
var ChatID = 0;
var RoomChatID = 0;
var ip;
var noPair = "0";
var network = false;

function loadRom(url) {
    $.ajax({
        url: url,
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhr.overrideMimeType !== 'undefined') {
                // Download as binary
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            return xhr;
        },
        complete: function(xhr, status) {
            var i, data;
            if (JSNES.Utils.isIE()) {
                var charCodes = JSNESBinaryToArray(
                        xhr.responseBody
                ).toArray();
                data = String.fromCharCode.apply(
                        undefined,
                        charCodes
                );
            }
            else {
                data = xhr.responseText;
            }
            var ret = nes.loadRom(data);
            nes.start();
        }
    });
}

function appendChat(msg) {
    var d = Chat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div id='Chat"+ChatID+"'/>").text(msg).appendTo(Chat);
    ChatID++;
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
    if (ChatID > 10) {
        var tempID = ChatID - 11;
        removeDiv("Chat"+tempID);
    }
}

function appendRoomChat(msg) {
    var d = roomChat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div id='RoomChat"+RoomChatID+"'/>").text(msg).appendTo(roomChat);
    RoomChatID++;
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
    if (RoomChatID > 10) {
        var tempID = RoomChatID - 11;
        removeDiv("RoomChat"+tempID);
    }
}

function appendUser(msg) {
    var d = users[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    msg.appendTo(users)
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
function appendRoom(msg) {
    var d = rooms[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    msg.appendTo(rooms)
    if (doScroll) {
    d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}
function createPair(url, romName) {
    $("#1-keyboard").show();
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "createPair", "data": romName, "url": url}));
    $("#leavePair").show();
    $("#ready").show();
    noPair = "1";
}
function leavePair() {
    $("#1-keyboard").show();
    $("#emulator").show();
    $("#video").hide();
    if (noPair==2) {
        if (nes.isRunning) {
            document.getElementById('stop').innerHTML = "暂停";
        }
        else {
            document.getElementById('stop').innerHTML = "继续";
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
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "leavePair"}));
    $("#leavePair").hide();
    $("#ready").hide();
    noPair = "0";
}

function joinPair(roomName){
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "joinPair", "roomName": roomName}));
    noPair = "2";
}

function loadButtonSet2(jsonData){
    nes.keyboard.updateKEY_A2(Number(jsonData.KEY_A));
    nes.keyboard.updateKEY_B2(Number(jsonData.KEY_B));
    nes.keyboard.updateKEY_SELECT2(Number(jsonData.KEY_SELECT));
    nes.keyboard.updateKEY_START2(Number(jsonData.KEY_START));
    nes.keyboard.updateKEY_UP2(Number(jsonData.KEY_UP));
    nes.keyboard.updateKEY_DOWN2(Number(jsonData.KEY_DOWN));
    nes.keyboard.updateKEY_LEFT2(Number(jsonData.KEY_LEFT));
    nes.keyboard.updateKEY_RIGHT2(Number(jsonData.KEY_RIGHT));
}

function disableButtons(set){
    $("#choose-rom").attr("disabled", set);

    $("#KEY_LEFT").attr("disabled", set);
    $("#KEY_UP").attr("disabled", set);
    $("#KEY_DOWN").attr("disabled", set);
    $("#KEY_RIGHT").attr("disabled", set);
    $("#KEY_SELECT").attr("disabled", set);
    $("#KEY_START").attr("disabled", set);
    $("#KEY_A").attr("disabled", set);
    $("#KEY_B").attr("disabled", set);

    $("#KEY_LEFT2").attr("disabled", set);
    $("#KEY_UP2").attr("disabled", set);
    $("#KEY_DOWN2").attr("disabled", set);
    $("#KEY_RIGHT2").attr("disabled", set);
    $("#KEY_SELECT2").attr("disabled", set);
    $("#KEY_START2").attr("disabled", set);
    $("#KEY_A2").attr("disabled", set);
    $("#KEY_B2").attr("disabled", set);
}

function readyPair(){
    if (!conn) {
        return false;
    }
    if (noPair=="1") {
        conn.send(JSON.stringify({
            "opt": "readyPair"
        }));
    } else if (noPair=="2") {
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
    $("#1-keyboard").hide();
    $("#ready").hide();
    disableButtons(true);
}

function unbindButton() {
    $("#canvas").
        unbind('keydown').
        unbind('keyup');
    $(document).
        unbind('keydown').
        unbind('keyup');
}

function bindLocal() {
    $("#canvas").
        unbind('keydown').
        unbind('keyup');
    $("#canvas").
        bind('keydown', function(evt) {
            self.nes.keyboard.keyDown1(evt);
        }).
        bind('keyup', function(evt) {
            self.nes.keyboard.keyUp1(evt);
        });
}

function bindNetwork() {
    unbindButton();
    if (noPair=="1") {
        $(document).
            bind('keydown', function(evt) {
                self.nes.keyboard.keyDown1(evt);
            }).
            bind('keyup', function(evt) {
                self.nes.keyboard.keyUp1(evt);
            });
    } else if (noPair=="2") {
        appendRoomChat("你是可怜的玩家2啊");
        $(document).
            bind('keydown', function(evt) {
                // conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "65"}));
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 65}));
                value = 65;
                switch (evt.keyCode) {
                    case nes.keyboard.key1Setting.KEY_A: document.getElementById('button_a').style.background = value==64?"url('/images/m/button_a.png')":"url('/images/m/button_a_over.png')"; break;      // X
                    case nes.keyboard.key1Setting.KEY_B: document.getElementById('button_b').style.background = value==64?"url('/images/m/button_b.png')":"url('/images/m/button_b_over.png')"; break;      // Z
                    case nes.keyboard.key1Setting.KEY_SELECT: document.getElementById('button_select').style.background = value==64?"url('/images/m/r_button_select.png')":"url('/images/m/r_button_select_over.png')"; break; // Right Ctrl
                    case nes.keyboard.key1Setting.KEY_START: document.getElementById('button_start').style.background = value==64?"url('/images/m/r_button_start.png')":"url('/images/m/r_button_start_over.png')"; break;  // Enter
                    case nes.keyboard.key1Setting.KEY_UP: document.getElementById('button_up').style.background = value==64?"url('/images/m/button_up.png')":"url('/images/m/button_up_over.png')"; break;     // Up
                    case nes.keyboard.key1Setting.KEY_DOWN: document.getElementById('button_down').style.background = value==64?"url('/images/m/button_down.png')":"url('/images/m/button_down_over.png')"; break;   // Down
                    case nes.keyboard.key1Setting.KEY_LEFT: document.getElementById('button_left').style.background = value==64?"url('/images/m/button_left.png')":"url('/images/m/button_left_over.png')"; break;   // Left
                    case nes.keyboard.key1Setting.KEY_RIGHT: document.getElementById('button_right').style.background = value==64?"url('/images/m/button_right.png')":"url('/images/m/button_right_over.png')"; break;  // Right
                    default: return true;
                }
            }).
            bind('keyup', function(evt) {
                // conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "64"}));
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 64}));
                value = 64;
                switch (evt.keyCode) {
                    case nes.keyboard.key1Setting.KEY_A: document.getElementById('button_a').style.background = value==64?"url('/images/m/button_a.png')":"url('/images/m/button_a_over.png')"; break;      // X
                    case nes.keyboard.key1Setting.KEY_B: document.getElementById('button_b').style.background = value==64?"url('/images/m/button_b.png')":"url('/images/m/button_b_over.png')"; break;      // Z
                    case nes.keyboard.key1Setting.KEY_SELECT: document.getElementById('button_select').style.background = value==64?"url('/images/m/r_button_select.png')":"url('/images/m/r_button_select_over.png')"; break; // Right Ctrl
                    case nes.keyboard.key1Setting.KEY_START: document.getElementById('button_start').style.background = value==64?"url('/images/m/r_button_start.png')":"url('/images/m/r_button_start_over.png')"; break;  // Enter
                    case nes.keyboard.key1Setting.KEY_UP: document.getElementById('button_up').style.background = value==64?"url('/images/m/button_up.png')":"url('/images/m/button_up_over.png')"; break;     // Up
                    case nes.keyboard.key1Setting.KEY_DOWN: document.getElementById('button_down').style.background = value==64?"url('/images/m/button_down.png')":"url('/images/m/button_down_over.png')"; break;   // Down
                    case nes.keyboard.key1Setting.KEY_LEFT: document.getElementById('button_left').style.background = value==64?"url('/images/m/button_left.png')":"url('/images/m/button_left_over.png')"; break;   // Left
                    case nes.keyboard.key1Setting.KEY_RIGHT: document.getElementById('button_right').style.background = value==64?"url('/images/m/button_right.png')":"url('/images/m/button_right_over.png')"; break;  // Right
                    default: return true;
                }
            });
    }
}

function startGame() {
    nes.reloadRom();
    self.nes.start();
    appendRoomChat("你可以开始游戏了");
}

var PeerConnection, pc;
var videoElement = document.getElementById("video");
var dataChannel, receiveChannel;
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
        appendRoomChat("dataChannel start");
    }
    dataChannel.onmessage = function(event) {
        appendRoomChat("dataChannel message");
    }
    dataChannel.onclose = function(event) {
        appendRoomChat("dataChannel closed");
    }
    
var audioContext = new AudioContext();
    pc.ondatachannel = function(event) {
        receiveChannel = event.channel;
        receiveChannel.onopen = function(event) {
            appendRoomChat("receiveChannel start");
        }
        receiveChannel.onmessage = function(event) {
            // appendChat("onmessage"));
            if (noPair=="1") {
                var jsonData=JSON.parse(event.data);
                if (jsonData.keyCode) {
                    switch (jsonData.keyCode) {
                        case nes.keyboard.key2Setting.KEY_A: nes.keyboard.state2[nes.keyboard.keys.KEY_A] = jsonData.value; break;     // Num-7
                        case nes.keyboard.key2Setting.KEY_B: nes.keyboard.state2[nes.keyboard.keys.KEY_B] = jsonData.value; break;     // Num-9
                        case nes.keyboard.key2Setting.KEY_SELECT: nes.keyboard.state2[nes.keyboard.keys.KEY_SELECT] = jsonData.value; break; // Num-3
                        case nes.keyboard.key2Setting.KEY_START: nes.keyboard.state2[nes.keyboard.keys.KEY_START] = jsonData.value; break;  // Num-1
                        case nes.keyboard.key2Setting.KEY_UP: nes.keyboard.state2[nes.keyboard.keys.KEY_UP] = jsonData.value; break;    // Num-8
                        case nes.keyboard.key2Setting.KEY_DOWN: nes.keyboard.state2[nes.keyboard.keys.KEY_DOWN] = jsonData.value; break;   // Num-2
                        case nes.keyboard.key2Setting.KEY_LEFT: nes.keyboard.state2[nes.keyboard.keys.KEY_LEFT] = jsonData.value; break;  // Num-4
                        case nes.keyboard.key2Setting.KEY_RIGHT: nes.keyboard.state2[nes.keyboard.keys.KEY_RIGHT] = jsonData.value; break; // Num-6
                    }
                } else if (jsonData.restart) {
                    nes.reloadRom();
                    nes.start();
                } else if (jsonData.stop) {
                    if (nes.isRunning) {
                        nes.stop();
                        document.getElementById('stop').innerHTML = "继续";
                    }
                    else {
                        nes.start();
                        document.getElementById('stop').innerHTML = "暂停";
                    }
                }
            } else if (noPair=="2") {
                nes.ui.dynamicaudio.writeInt(event.data.split(","));
            }
        }
        receiveChannel.onclose = function(event) {
            appendRoomChat("receiveChannel closed");
        }
    }
    //如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    pc.onaddstream = function(event){
        // appendChat("pc.onaddstream"));
        $("#emulator").hide();
        $("#video").show();
        nes.rom=null;
        nes.stop();
        nes.start();
        videoElement.src = URL.createObjectURL(event.stream);
    };
}
var videoStream;
function video() {
    // getUserMedia = (navigator.getUserMedia ||
    //         navigator.webkitGetUserMedia ||
    //         navigator.mozGetUserMedia ||
    //         navigator.msGetUserMedia);
    // getUserMedia.call(navigator, { 
    //         "audio": true,
    //         "video": false
    //     } , function(stream) {
            videoStream = document.querySelector("canvas").captureStream();
            // var AudioTracks = stream.getAudioTracks();
            // stream.addTrack(AudioTracks[0]);
            // stream.addTrack(videoStream.getTrackById(0));
            // console.log(videoStream);
            // appendChat("pc.addStream(videoStream)"));
            pc.addStream(videoStream);
            pc.createOffer().then(function(offer) {
                return pc.setLocalDescription(offer);
            }).then(function() {
                conn.send(JSON.stringify({
                    "opt": "__offer",
                    "sdp": pc.localDescription
                }));
            });
    //     }, function(err) {
    //         console.log("The following error occurred: " + err.name);
    //     }
    // );
}

if (window["WebSocket"]) {
    conn = new WebSocket("ws://"+$('#host')[0].innerHTML+"/ws");
    conn.onclose = function(evt) {
        appendChat("与服务器断开连接了呀");
    }
    conn.onmessage = function(evt) {
        var jsonData=JSON.parse(evt.data);
        // appendChat(jsonData.opt+": "+jsonData.data));
        switch(jsonData.opt) 
        { 
            case "msg":
                appendChat(jsonData.data);
                break; 
            case "name":
                if ($('#ip1').text()==jsonData.ip) {
                    $('#name1').text(jsonData.data);
                    $('#name2').text(jsonData.data);
                }
                appendChat(jsonData.ip+"修改他的昵称为"+jsonData.data);
                if (document.getElementById(jsonData.ip)) {
                    removeDiv(jsonData.ip);
                    appendUser($("<div id=" + jsonData.ip + "/>").text(jsonData.ip+" - "+jsonData.data));
                }
                break; 
            case "msgPair":
                appendRoomChat(jsonData.data);
                break; 
            case "listRooms":
                if (!document.getElementById(jsonData.ip)) {
                    appendUser($("<div id=" + jsonData.ip + "/>").text(jsonData.ip+" - "+jsonData.name));
                }
                appendRoom($("<div id="+jsonData.roomName+" onclick=\"joinPair('"+jsonData.roomName+"')\"/>").text(jsonData.ip+" - "+jsonData.name+' - ' + jsonData.data));
                break; 
            case "listPlayers":
                if (!document.getElementById(jsonData.data)) {
                    appendUser($("<div id=" + jsonData.data + "/>").text(jsonData.data+" - "+jsonData.name));
                }
                break; 
            case "in": 
                if (!document.getElementById(jsonData.data)) {
                    appendUser($("<div id=" + jsonData.data + "/>").text(jsonData.data+" - "+jsonData.name));
                }
                appendChat(jsonData.data+" - "+jsonData.name+"来到了平台");
                break; 
            case "ip":
                $('#ip1').text(jsonData.data);
                $('#ip2').text(jsonData.data);
                break; 
            case "out": 
                if (document.getElementById(jsonData.data)) {
                    removeDiv(jsonData.data);
                    appendChat(jsonData.data+" - "+jsonData.name+'离开了平台，回家吃饭了');
                }
                break; 
            case "readyPair":
                appendRoomChat("玩家"+jsonData.no+" "+jsonData.ip+" - "+jsonData.name+"已经准备好了");
                break; 
            case "createPair":
                appendRoom($("<div id="+jsonData.roomName+" onclick=\"joinPair('"+jsonData.roomName+"')\"/>").text(jsonData.ip+" - "+jsonData.name+' - ' + jsonData.data));
                appendChat(jsonData.ip+" - "+jsonData.name+"创建了游戏"+jsonData.data);
                break; 
            case "leavePair":
                activeButtons(1);
                if (jsonData.empty=="true") {
                    if (document.getElementById(jsonData.roomName)) {
                        removeDiv(jsonData.roomName);
                    }
                }
                disableButtons(false);
                bindLocal();
                appendRoomChat(jsonData.ip+" - "+jsonData.name+"离开了双人房"+jsonData.roomName);
                break; 
            case "joinPair":
                unbindButton(jsonData);
                if (noPair == "2") {
                    $("#leavePair").show();
                    $("#ready").show();
                    appendRoomChat("等待其他玩家准备");
                }
                appendRoomChat(jsonData.ip+" - "+jsonData.name+"来到了双人房"+jsonData.roomName);
                break;
            case "startPair":
                if(noPair=="1"){
                    appendRoomChat("正在加载玩家2按键设置...");
                    loadButtonSet2(jsonData);
                } else if(noPair=="2"){
                    document.getElementById('stop').innerHTML = "暂停/继续";
                    document.getElementById('stop').onclick = function() {
                        dataChannel.send(JSON.stringify({"stop": true}));
                    }
                    document.getElementById('restart').onclick = function() {
                        dataChannel.send(JSON.stringify({"restart": true}));
                    }
                }
                bindNetwork();
                appendRoomChat("游戏开始");
                prepare();
                if(noPair=="1"){
                    startGame();
                    video();
                }
                break;
            // case "keyboard":
            //     keyboard(jsonData);
            //     break;
            case "__ice_candidate":
                appendRoomChat("__ice_candidate");
                var mid = new RTCIceCandidate(jsonData.candidate);
                pc.addIceCandidate(mid);
                break;
            case "__offer":
                appendRoomChat("__offer");
                var mid = new RTCSessionDescription(jsonData.sdp);
                pc.setRemoteDescription(mid);
                activeButtons(2);
                pc.createAnswer().then(function(answer) {
                    return pc.setLocalDescription(answer);
                }).then(function() {
                    conn.send(JSON.stringify({
                        "opt": "__answer",
                        "sdp": pc.localDescription
                    }));
                });
                break;
            case "__answer":
                network = true;
                activeButtons(1);
                appendRoomChat("__answer");
                var mid = new RTCSessionDescription(jsonData.sdp);
                pc.setRemoteDescription(mid);
                break;
            default: 
                // appendChat(jsonData.data);
                break;
        } 
    }
} else {
    appendChat($("<div><b>Your browser does not support WebSockets.</b></div>"))
}
