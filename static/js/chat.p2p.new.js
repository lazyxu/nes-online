var conn;
var msg = $("#msg");
var Chat = $("#info");
var roomChat = $("#room_chat");
var Mix = $("#mixinfo");
var users = $("#users");
var rooms = $("#rooms");
var IP="";
var RoomPlayerNO = 0;
var RoomID = 0;
var GameName = "";
var network = false;
var button_x = false; //85
var button_y = false; //73
var chatPos = "Msg";
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
            GameName = url;
            var ret = nes.loadRom(data);
            // document.getElementById("loaded").innerHTML = ret;
            // appendChat("ret: "+ret);
            nes.start();
        }
    });
}

function appendMix(msg) {
    var d = Chat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div/>").text(msg).appendTo(Mix);
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}
function appendSys(msg) {
    var d = Chat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    msg.appendTo(Mix);
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}
function appendChat(msg) {
    msg = "[大厅]: "+msg;
    appendMix(msg);
    var d = Chat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div/>").text(msg).appendTo(Chat);
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}

function appendRoomChat(msg) {
    msg = "[双人房]: "+msg;
    appendMix(msg);
    var d = roomChat[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    $("<div/>").text(msg).appendTo(roomChat);
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
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
function appendRoom(jsonData) {
    var d = rooms[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    var Room = $("<div class='Room' id='Room"+jsonData.RoomID+"' data-dismiss='modal' aria-hidden='true' onclick=\"joinDoubleRoom("+jsonData.RoomID+")\">"
        +"<div class='RoomName' id='RoomName"+jsonData.RoomID+"' >"+jsonData.RoomName+"</div>"
        +"<div class='Name' id='Name"+jsonData.RoomID+"' >"+jsonData.Name+"</div>"
        +"<div class='GameName'>"+jsonData.GameName+"</div>"
        +"<div class='PlayerNum' id='PlayerNum"+jsonData.RoomID+"' >"+jsonData.PlayerNum +"/"+ jsonData.PlayerMaxNum+"</div>"
        +"</div>");
    Room.appendTo(rooms);
    // document.getElementById("Room"+jsonData.RoomID).style.backgroundColor = "red";
    if (doScroll) {
        d.scrollTop = d.scrollHeight - d.clientHeight;
    }
}

function updatePosition(jsonData) {
    if (RoomID!=0 && RoomPlayerNO!=0) {
        document.getElementById("MyRoom").style.display = "inline";
        document.getElementById("MyRoomName").innerHTML = "双人房"+jsonData.RoomID;
        document.getElementById("MyGameName").innerHTML = jsonData.GameName;
        document.getElementById("MyPlayerNum").innerHTML = " - ["+jsonData.PlayerNum +"/"+ jsonData.PlayerMaxNum+"]";
    } else {
        document.getElementById("MyRoom").style.display = "none";
        document.getElementById("MyRoomName").innerHTML = "";
        document.getElementById("MyGameName").innerHTML = "";
        document.getElementById("MyPlayerNum").innerHTML = "";
    }
}

function updateRoomPlayerNum(jsonData){
    if (jsonData.PlayerMaxNum) {
        if (jsonData.PlayerNum == jsonData.PlayerMaxNum) {
            document.getElementById("Room"+jsonData.RoomID).style.backgroundColor = "black";
        } else {
            document.getElementById("Room"+jsonData.RoomID).style.backgroundColor = "#033459";
        }
        document.getElementById("PlayerNum"+jsonData.RoomID).innerHTML = jsonData.PlayerNum +"/"+ jsonData.PlayerMaxNum;
    }
}

function createDoubleRoom(GameName) {
    conn.send(JSON.stringify({"Handle": "createDoubleRoom", "GameName": GameName}));
}
function clearRom() {
    nes.rom=null;
    nes.stop();
    nes.start();
    nes.ui.resetCanvas();
}

function leaveDoubleRoom() {
    clearRom();
    $("#emulator").show();
    $("#video").hide();
    if (RoomPlayerNO==2) {
        if (nes.isRunning) {
            document.getElementById('stop').innerHTML = "暂停";
        }
        else {
            document.getElementById('stop').innerHTML = "继续";
        }
        if (nes.opts.emulateSound == true) {
            document.getElementById('sound').style.background = "url('/images/m/ic_sound.png')";
        } else if (nes.opts.emulateSound == false) {
            document.getElementById('sound').style.background = "url('/images/m/ic_device_access_volume_muted.png')";
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
            document.getElementById('sound').style.background = "url('/images/m/ic_device_access_volume_muted.png')";
        } else if (nes.opts.emulateSound == false) {
            nes.opts.emulateSound = true;
            document.getElementById("video").muted = false;
            document.getElementById('sound').style.background = "url('/images/m/ic_sound.png')";
        }
    }
    conn.send(JSON.stringify({"Handle": "leaveDoubleRoom"}));
    $("#leaveDoubleRoom").hide();
    $("#readyDoubleRoom").hide();
    RoomPlayerNO = 0;
    RoomID = 0;
}

function joinDoubleRoom(RoomID){
    conn.send(JSON.stringify({"Handle": "joinDoubleRoom", "RoomID": RoomID}));
}

function disableButtons(set){
    $("#choose-rom").attr("disabled", set);
}

function readyDoubleRoom(){
    conn.send(JSON.stringify({
        "Handle": "readyDoubleRoom"
    }));
    $("#readyDoubleRoom").hide();
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
    if (RoomPlayerNO==1) {
        $(document).
            bind('keydown', function(evt) {
                self.nes.keyboard.keyDown1(evt);
            }).
            bind('keyup', function(evt) {
                self.nes.keyboard.keyUp1(evt);
            });
    } else if (RoomPlayerNO==2) {
        appendRoomChat("你是可怜的玩家2啊");
        $(document).
            bind('keydown', function(evt) {
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 65}));
                value = 65;
                switch (evt.keyCode) {
                    case nes.keyboard.key1Setting.KEY_X: document.getElementById('button_a_turbo').style.background = value==64?"url('/images/m/button_a_turbo.png')":"url('/images/m/button_a_turbo_over.png')"; break; 
                    case nes.keyboard.key1Setting.KEY_Y: document.getElementById('button_b_turbo').style.background = value==64?"url('/images/m/button_b_turbo.png')":"url('/images/m/button_b_turbo_over.png')"; break; 
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
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 64}));
                value = 64;
                switch (evt.keyCode) {
                    case nes.keyboard.key1Setting.KEY_X: document.getElementById('button_a_turbo').style.background = value==64?"url('/images/m/button_a_turbo.png')":"url('/images/m/button_a_turbo_over.png')"; break; 
                    case nes.keyboard.key1Setting.KEY_Y: document.getElementById('button_b_turbo').style.background = value==64?"url('/images/m/button_b_turbo.png')":"url('/images/m/button_b_turbo_over.png')"; break; 
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
            "Handle": "__ice_candidate",
            "candidate": event.candidate
        }));
    };
    var dataChannelOptions = {
        ordered:true,
        maxRetransmitTime: 3000
    }
    dataChannel = pc.createDataChannel("button", dataChannelOptions);
    dataChannel.onopen = function(event) {
        appendRoomChat("dataChannel建立成功，可以开始游戏了");
        dataChannel.send(JSON.stringify({
            "keyboardSet": true, 
            "KEY_UP":Number($('#KEY_UP').val()),
            "KEY_DOWN":Number($('#KEY_DOWN').val()),
            "KEY_LEFT":Number($('#KEY_LEFT').val()),
            "KEY_RIGHT":Number($('#KEY_RIGHT').val()),
            "KEY_SELECT":Number($('#KEY_SELECT').val()),
            "KEY_START":Number($('#KEY_START').val()),
            "KEY_A":Number($('#KEY_A').val()),
            "KEY_B":Number($('#KEY_B').val()),
            "KEY_X":Number($('#KEY_X').val()),
            "KEY_Y":Number($('#KEY_Y').val()),
        }));
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
            if (RoomPlayerNO==1) {
                var jsonData=JSON.parse(event.data);
                if (jsonData.keyCode) {
                    // appendChat(jsonData.keyCode);
                    switch (jsonData.keyCode) {
                        case nes.keyboard.key2Setting.KEY_X:
                            if (jsonData.value==0x41) {
                                if (nes.keyboard.IntervalX2) {
                                    window.clearInterval(nes.keyboard.IntervalX2);
                                    nes.keyboard.IntervalX2 = null;
                                }
                                nes.keyboard.IntervalX2 = setInterval(function(){
                                    if (nes.keyboard.state2[nes.keyboard.keys.KEY_A]==0x40)
                                        nes.keyboard.state2[nes.keyboard.keys.KEY_A] = 0x41;
                                    else if (nes.keyboard.state2[nes.keyboard.keys.KEY_A]==0x41)
                                        nes.keyboard.state2[nes.keyboard.keys.KEY_A] = 0x40;
                                }, 50);
                            }
                            else if (jsonData.value==0x40) {
                                window.clearInterval(nes.keyboard.IntervalX2);
                                nes.keyboard.IntervalX2 = null;
                                nes.keyboard.state2[nes.keyboard.keys.KEY_A] = 0x40;
                            }
                            break; 
                        case nes.keyboard.key2Setting.KEY_Y:
                            if (jsonData.value==0x41) {
                                if (nes.keyboard.IntervalY2) {
                                    window.clearInterval(nes.keyboard.IntervalY2);
                                    nes.keyboard.IntervalY2 = null;
                                }
                                nes.keyboard.IntervalY2 = setInterval(function(){
                                    if (nes.keyboard.state2[nes.keyboard.keys.KEY_B]==0x40)
                                        nes.keyboard.state2[nes.keyboard.keys.KEY_B] = 0x41;
                                    else if (nes.keyboard.state2[nes.keyboard.keys.KEY_B]==0x41)
                                        nes.keyboard.state2[nes.keyboard.keys.KEY_B] = 0x40;
                                }, 50);
                            }
                            else if (jsonData.value==0x40) {
                                window.clearInterval(nes.keyboard.IntervalY2);
                                nes.keyboard.IntervalY2 = null;
                                nes.keyboard.state2[nes.keyboard.keys.KEY_B] = 0x40;
                            }
                            break; 
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
                        dataChannel.send(JSON.stringify({"stop": false}));
                    }
                    else {
                        nes.start();
                        document.getElementById('stop').innerHTML = "暂停";
                        dataChannel.send(JSON.stringify({"stop": true}));
                    }
                } else if (jsonData.sound) {
                    if (nes.opts.emulateSound == true) {
                        nes.opts.emulateSound = false;
                        document.getElementById('sound').style.background = "url('/images/m/ic_device_access_volume_muted.png')";
                        dataChannel.send(JSON.stringify({"sound": false}));
                    } else if (nes.opts.emulateSound == false) {
                        nes.opts.emulateSound = true;
                        document.getElementById('sound').style.background = "url('/images/m/ic_sound.png')";
                        dataChannel.send(JSON.stringify({"sound": true}));
                    }
                } else if (jsonData.keyboardSet) {
                    appendRoomChat("正在更新玩家2的按键设置...");
                    if (jsonData.KEY_X)
                        nes.keyboard.updateKEY_X2(jsonData.KEY_X);
                    if (jsonData.KEY_Y)
                        nes.keyboard.updateKEY_Y2(jsonData.KEY_Y);
                    if (jsonData.KEY_A)
                        nes.keyboard.updateKEY_A2(jsonData.KEY_A);
                    if (jsonData.KEY_B)
                        nes.keyboard.updateKEY_B2(jsonData.KEY_B);
                    if (jsonData.KEY_SELECT)
                        nes.keyboard.updateKEY_SELECT2(jsonData.KEY_SELECT);
                    if (jsonData.KEY_START)
                        nes.keyboard.updateKEY_START2(jsonData.KEY_START);
                    if (jsonData.KEY_UP)
                        nes.keyboard.updateKEY_UP2(jsonData.KEY_UP);
                    if (jsonData.KEY_DOWN)
                        nes.keyboard.updateKEY_DOWN2(jsonData.KEY_DOWN);
                    if (jsonData.KEY_LEFT)
                        nes.keyboard.updateKEY_LEFT2(jsonData.KEY_LEFT);
                    if (jsonData.KEY_RIGHT)
                        nes.keyboard.updateKEY_RIGHT2(jsonData.KEY_RIGHT);
                }
            } else if (RoomPlayerNO==2) {
                if ( event.data.length > 1000) {
                    nes.ui.dynamicaudio.writeInt(event.data.split(","));
                } else {
                    var jsonData=JSON.parse(event.data);
                    if (jsonData.samples){
                        nes.ui.dynamicaudio.writeInt(jsonData.samples.split(","));
                    } else if (jsonData.sound!="undefined") {
                        if (!jsonData.sound) {
                            document.getElementById("video").muted = true;
                            document.getElementById('sound').style.background = "url('/images/m/ic_device_access_volume_muted.png')";
                        } else {
                            document.getElementById("video").muted = false;
                            document.getElementById('sound').style.background = "url('/images/m/ic_sound.png')";
                        }
                    } else if (jsonData.stop!=null) {
                        if (jsonData.stop) {
                            document.getElementById('stop').innerHTML = "暂停";
                        }
                        else {
                            document.getElementById('stop').innerHTML = "继续";
                        }
                    }
                }
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
        clearRom()
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
                    "Handle": "__offer",
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
        // appendChat(jsonData.Handle+": "+jsonData.data));
        switch(jsonData.Handle) 
        { 
            case "Msg":
                appendChat(jsonData.Msg);
                break; 
            case "RoomMsg":
                appendRoomChat(jsonData.Msg);
                break; 
            case "Rename":
                if ($('#ip1').text()==jsonData.IP) {
                    $('#name1').text(jsonData.NewName);
                    $('#name2').text(jsonData.NewName);
                    $('#name3').text(jsonData.Name);
                }
                appendChat(jsonData.IP+" 修改他的昵称为 "+jsonData.NewName);
                if (document.getElementById(jsonData.IP)) {
                    removeDiv(jsonData.IP);
                    appendUser($("<div id=" + jsonData.IP + "/>").text(jsonData.IP+" - "+jsonData.NewName));
                }
                break; 
            case "listRooms":
                if (!document.getElementById(jsonData.IP)) {
                    appendUser($("<div id=" + jsonData.IP + "/>").text(jsonData.IP+" - "+jsonData.Name));
                }
                appendRoom(jsonData);
                break; 
            case "listPlayers":
                if (!document.getElementById(jsonData.IP)) {
                    appendUser($("<div id=" + jsonData.IP + "/>").text(jsonData.IP+" - "+jsonData.Name));
                }
                break; 
            case "IN": 
                if (!document.getElementById(jsonData.IP)) {
                    appendUser($("<div id=" + jsonData.IP + "/>").text(jsonData.IP+" - "+jsonData.Name));
                }
                appendChat(jsonData.IP+" - "+jsonData.Name+" 来到了平台");
                break; 
            case "IP":
                IP = jsonData.IP
                $('#ip1').text(jsonData.IP);
                $('#ip2').text(jsonData.IP);
                $('#ip3').text(jsonData.IP);
                $('#name1').text(jsonData.Name);
                $('#name2').text(jsonData.Name);
                $('#name3').text(jsonData.Name);
                break; 
            case "out": 
                if (document.getElementById(jsonData.IP)) {
                    removeDiv(jsonData.IP);
                    appendChat(jsonData.IP+" - "+jsonData.Name+' 离开了平台，回家吃饭了');
                }
                break; 
            case "createDoubleRoom":
                appendRoom(jsonData);
                appendChat(jsonData.IP+" - "+jsonData.Name+" 创建了游戏"+jsonData.GameName);
                if (jsonData.IP == IP) {
                    activeButtons(1);
                    bindLocal();
                    $("#leaveDoubleRoom").show();
                    $("#readyDoubleRoom").show();
                    $("#button_local-choose-rom").hide();
                    RoomID = jsonData.RoomID;
                    RoomPlayerNO = 1;
                    appendRoomChat(jsonData.IP+" - "+jsonData.Name+" 来到了双人房"+jsonData.RoomID);
                    updatePosition(jsonData);
                }
                break; 
            case "readyDoubleRoom":
                if (jsonData.IP == IP) {
                    $("#1-keyboard").hide();
                    $("#2-keyboard").hide();
                }
                appendRoomChat("玩家"+jsonData.RoomPlayerNO+" "+jsonData.IP+" - "+jsonData.Name+"已经准备好了");
                break;
            case "leaveDoubleRoom":
                updateRoomPlayerNum(jsonData);
                appendRoomChat(jsonData.IP+" - "+jsonData.Name+" 离开了双人房"+jsonData.RoomID);
                if (jsonData.Empty) {
                    if (document.getElementById("Room"+jsonData.RoomID)) {
                        removeDiv("Room"+jsonData.RoomID);
                    }
                    appendRoomChat("双人房"+jsonData.RoomID+" 已经被炸毁...");
                    if ( jsonData.RoomID == RoomID ) {
                        $("#leaveDoubleRoom").hide();
                        $("#readyDoubleRoom").hide();
                        $("#button_local-choose-rom").show();
                        RoomPlayerNO = 0;
                        RoomID = 0;
                        activeButtons(1);
                        disableButtons(false);
                        bindLocal();
                        $("#1-keyboard").show();
                        $("#2-keyboard").show();
                        updatePosition(jsonData);
                        if(pc)
                            pc.close();
                    }
                }
                if ( jsonData.IP == IP ) {
                    $("#leaveDoubleRoom").hide();
                    $("#readyDoubleRoom").hide();
                    $("#button_local-choose-rom").show();
                    RoomPlayerNO = 0;
                    RoomID = 0;
                    activeButtons(1);
                    disableButtons(false);
                    bindLocal();
                    $("#1-keyboard").show();
                    $("#2-keyboard").show();
                    updatePosition(jsonData);
                    if(pc)
                            pc.close();
                }
                break; 
            case "joinDoubleRoomFailed":
                appendChat("加入该双人房"+jsonData.RoomID+"失败: "+jsonData.ErrMsg);
                break;
            case "joinDoubleRoom":
                updateRoomPlayerNum(jsonData);
                if (jsonData.IP == IP) {
                    RoomPlayerNO = 2;
                    RoomID = jsonData.RoomID;
                    $("#leaveDoubleRoom").show();
                    $("#readyDoubleRoom").show();
                    $("#button_local-choose-rom").hide();
                    updatePosition(jsonData);
                }
                if (jsonData.RoomID == RoomID) {
                    appendRoomChat(jsonData.IP+" - "+jsonData.Name+" 来到了双人房"+jsonData.RoomID);
                    updatePosition(jsonData);
                }
                break;
            case "startDoubleRoom":
                appendRoomChat("所有玩家都准备好了");
                if(RoomPlayerNO==1){
                    document.getElementById('sound').onclick = function() {
                        if (nes.opts.emulateSound == true) {
                            nes.opts.emulateSound = false;
                            document.getElementById('sound').style.background = "url('/images/m/ic_device_access_volume_muted.png')";
                            dataChannel.send(JSON.stringify({"sound": false}));
                        } else if (nes.opts.emulateSound == false) {
                            nes.opts.emulateSound = true;
                            document.getElementById('sound').style.background = "url('/images/m/ic_sound.png')";
                            dataChannel.send(JSON.stringify({"sound": true}));
                        }
                    }

                    document.getElementById('stop').onclick = function() {
                        if (nes.isRunning) {
                            nes.stop();
                            document.getElementById('stop').innerHTML = "继续";
                            dataChannel.send(JSON.stringify({"stop": false}));
                        }
                        else {
                            nes.start();
                            document.getElementById('stop').innerHTML = "暂停";
                            dataChannel.send(JSON.stringify({"stop": true}));
                        }
                    }
                } else if(RoomPlayerNO==2){
                    document.getElementById('stop').onclick = function() {
                        dataChannel.send(JSON.stringify({"stop": true}));
                    }
                    document.getElementById('sound').onclick = function() {
                        dataChannel.send(JSON.stringify({"sound": true}));
                    }
                    document.getElementById('restart').onclick = function() {
                        dataChannel.send(JSON.stringify({"restart": true}));
                    }
                }
                bindNetwork();
                appendRoomChat("正在进行p2p连接...");
                prepare();
                if(RoomPlayerNO==1){
                    startGame();
                    video();
                }
                break;
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
                bindNetwork();
                pc.createAnswer().then(function(answer) {
                    return pc.setLocalDescription(answer);
                }).then(function() {
                    conn.send(JSON.stringify({
                        "Handle": "__answer",
                        "sdp": pc.localDescription
                    }));
                });
                break;
            case "__answer":
                network = true;
                activeButtons(1);
                bindLocal();
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
