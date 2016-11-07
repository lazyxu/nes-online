var conn;
var msg = $("#msg");
var ChatContent = $("#ChatContent");
var users = $("#users");
var rooms = $("#rooms");
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

function appendLog(msg) {
    var d = ChatContent[0]
    var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
    msg.appendTo(ChatContent)
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
    $("#2-keyboard").hide();
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "createPair", "data": romName, "url": url}));
    $("#leavePair").attr("disabled", false);
    $("#ready").attr("disabled", false);
    noPair = "1";
}
function leavePair() {
    $("#1-keyboard").show();
    $("#2-keyboard").hide();
    if (!conn) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "leavePair"}));
    $("#leavePair").attr("disabled", true);
    $("#ready").attr("disabled", true);
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
    $("#nes-pause").attr("disabled", set);
    $("#nes-restart").attr("disabled", set);
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
    $("#ready").attr("disabled", true);
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
            self.nes.keyboard.keyDown(evt);
        }).
        bind('keyup', function(evt) {
            self.nes.keyboard.keyUp(evt);
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
        appendLog($("<div/>").text("你是可怜的玩家2啊"));
        $(document).
            bind('keydown', function(evt) {
                // conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "65"}));
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 65}));
            }).
            bind('keyup', function(evt) {
                // conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "64"}));
                dataChannel.send(JSON.stringify({"keyCode": evt.keyCode, "value": 64}));
            });
    }
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

function startGame() {
    nes.reloadRom();
    self.nes.start();
    appendLog($("<div/>").text("你可以开始游戏了"));
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
        appendLog($("<div/>").text("dataChannel start"));
    }
    dataChannel.onmessage = function(event) {
        appendLog($("<div/>").text("dataChannel message"));
    }
    dataChannel.onclose = function(event) {
        appendLog($("<div/>").text("dataChannel closed"));
    }
    
var audioContext = new AudioContext();
    pc.ondatachannel = function(event) {
        receiveChannel = event.channel;
        receiveChannel.onopen = function(event) {
            appendLog($("<div/>").text("receiveChannel start"));
        }
        receiveChannel.onmessage = function(event) {
            appendLog($("<div/>").text("onmessage"));
            if (noPair=="1") {
                var jsonData=JSON.parse(event.data);
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
            } else if (noPair=="2") {
                // appendLog($("<div/>").text("nes.ui.dynamicaudio.writeInt(event.data)"));
                // var buffer = this.audioContext.createBuffer(2, 17000, audioContext.sampleRate);
                // console.log(event.data);
                // buffer = event.data;
                // console.log(buffer);
                nes.ui.dynamicaudio.writeInt(event.data.split(","));
                // var buffer = audioContext.createBuffer(2, samples.length, audioContext.sampleRate);
                // var channelLeft = buffer.getChannelData(0);
                // var channelRight = buffer.getChannelData(1);
                // var j = 0;
                // for (var i = 0; i < samples.length; i += 2) {
                //     channelLeft[j] = (samples[i]) / 32768;
                //     channelRight[j] = (samples[i+1]) / 32768;
                //     j++;
                // }
                // Create sound source and play samples from buffer
                // var source = audioContext.createBufferSource();
                // source.buffer = event.data;
                // // this.local_output = this.audioContext.createMediaStreamDestination();
                // source.connect(audioContext.destination);
                // // var source = nes.ui.dynamicaudio.audioContext.createBufferSource();
                // // source.buffer = event.data;
                // // source.connect(nes.ui.dynamicaudio.audioContext.destination);
                // source.start();
            }
        }
        receiveChannel.onclose = function(event) {
            appendLog($("<div/>").text("receiveChannel closed"));
        }
    }
    //如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    pc.onaddstream = function(event){
        appendLog($("<div/>").text("pc.onaddstream"));
        $("#emulator").css({display: "none"});
        $("#video").css({display: ""});
        nes.rom=null;
        nes.stop();
        nes.start();
        // document.getElementById("audio").src = URL.createObjectURL(event.stream);
        // document.getElementById("audio").play();
        videoElement.src = URL.createObjectURL(event.stream);
        // console.log(event);
        // videoElement.play();
    };
}
var videoStream;
function video() {
    getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
    getUserMedia.call(navigator, { 
                "audio": true,
                "video": false
            } , function(stream) {
                videoStream = document.querySelector("canvas").captureStream();
                // var AudioTracks = stream.getAudioTracks();
                // stream.addTrack(AudioTracks[0]);
                // stream.addTrack(videoStream.getTrackById(0));
                // console.log(videoStream);
                // appendLog($("<div/>").text("pc.addStream(videoStream)"));
                pc.addStream(videoStream);
                pc.createOffer().then(function(offer) {
                    return pc.setLocalDescription(offer);
                }).then(function() {
                    conn.send(JSON.stringify({
                        "opt": "__offer",
                        "sdp": pc.localDescription
                    }));
                });
            }, function(err) {
                console.log("The following error occurred: " + err.name);
            }
        );
    // } else {
    //     console.log("getUserMedia not supported");
    // }
    // 如果是发送方则发送一个offer信令，否则发送一个answer信令
    // var context = new Context();
    // var videoSource = context.createMediaStreamSource(videoStream);
    // var audioSource = context.createMediaStreamSource(peerSource);
    // var analyser = context.createAnalyser();
    // var mixedOutput = context.createMediaStreamDestination();
    // audioSource.connect(analyser);
    // analyser.connect(mixedOutput);
    // videoSource.connect(mixedOutput);



    // var audioContext = nes.ui.dynamicaudio.audioContext;
    // console.log(audioContext);
    // var streamDestination = audioContext.createMediaStreamDestination();
    // console.log(streamDestination);
    // nes.ui.dynamicaudio.source.connect(streamDestination);

    // var audioStream = nes.ui.dynamicaudio.peerSource;
    // console.log(audioStream);
    // var audioTracks = audioStream.getAudioTracks();
    // console.log(audioTracks[0]);
    // var videoTracks = videoStream.getVideoTracks();
    // console.log(videoTracks[0]);
    // audioStream.addTrack(videoTracks[0]);

    // 绑定本地媒体流到video标签用于输出
    // videoElement.src = URL.createObjectURL(stream);
    // videoElement.play();
    // 向PeerConnection中加入需要发送的流


}

if (window["WebSocket"]) {
    conn = new WebSocket("ws://"+$('#host')[0].innerHTML+"/ws");
    conn.onclose = function(evt) {
        appendLog($("<div><b>Connection closed.</b></div>"));
    }
    conn.onmessage = function(evt) {
        var jsonData=JSON.parse(evt.data);
        // appendLog($("<div/>").text(jsonData.opt+": "+jsonData.data));
        switch(jsonData.opt) 
        { 
            case "msg":
                appendLog($("<div/>").text(jsonData.data));
                break; 
            case "in": 
                if (!document.getElementById(jsonData.data)) {
                    appendUser($("<div id=" + jsonData.data + "/>").text(jsonData.data));
                }
                appendLog($("<div/>").text(jsonData.data+"来到了平台"));
                break; 
            case "ip":
                $('#ip').text(" "+jsonData.data);
                break; 
            case "out": 
                if (document.getElementById(jsonData.data)) {
                    removeDiv(jsonData.data);
                    appendLog($("<div/>").text(jsonData.data+'离开了平台，回家吃饭了'));
                }
                break; 
            case "readyPair":
                appendLog($("<div/>").text("玩家"+jsonData.no+" "+jsonData.ip+"已经准备好了"));
                break; 
            case "createPair":
                appendRoom($("<div id="+jsonData.roomName+" onclick=\"joinPair('"+jsonData.roomName+"')\"/>").text(jsonData.ip+' - ' + jsonData.data));
                appendLog($("<div/>").text(jsonData.ip+"创建了游戏"+jsonData.data));
                break; 
            case "leavePair":
                if (jsonData.empty=="true") {
                    if (document.getElementById(jsonData.roomName)) {
                        removeDiv(jsonData.roomName);
                    }
                }
                disableButtons(false);
                bindLocal();
                appendLog($("<div/>").text(jsonData.ip+"离开了双人房"+jsonData.roomName));
                break; 
            case "joinPair":
                unbindButton(jsonData);
                if (noPair == "2") {
                    $("#1-keyboard").hide();
                    $("#2-keyboard").show();
                    $("#leavePair").attr("disabled", false);
                    $("#ready").attr("disabled", false);
                    loadRom(jsonData.url);
                    appendLog($("<div/>").text("加载游戏"+jsonData.url));
                }
                appendLog($("<div/>").text(jsonData.ip+"来到了双人房"+jsonData.roomName));
                break;
            case "startPair":
                if(noPair=="1"){
                    appendLog($("<div/>").text("正在加载玩家2按键设置..."));
                    loadButtonSet2(jsonData);
                }
                bindNetwork();
                appendLog($("<div/>").text("游戏开始"));
                prepare();
                network = true;
                if(noPair=="1"){
                    startGame();
                    video();
                }
                break;
            // case "keyboard":
            //     keyboard(jsonData);
            //     break;
            case "__ice_candidate":
                appendLog($("<div/>").text("__ice_candidate"));
                var mid = new RTCIceCandidate(jsonData.candidate);
                pc.addIceCandidate(mid);
                break;
            case "__offer":
                appendLog($("<div/>").text("__offer"));
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
                break;
            case "__answer":
                appendLog($("<div/>").text("__answer"));
                var mid = new RTCSessionDescription(jsonData.sdp);
                pc.setRemoteDescription(mid);
                break;
            default: 
                // appendLog($("<div/>").text(jsonData.data));
                break;
        } 
    }
} else {
    appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
}
