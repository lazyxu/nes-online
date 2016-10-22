var conn;
var msg = $("#msg");
var ChatContent = $("#ChatContent");
var users = $("#users");
var rooms = $("#rooms");
var ip;
var maxPing=100;
var noPair = 0;
var time1;
var dtime;
var start;
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
    // appendLog($("<div/>").text(jsonData.KEY_A));
    // appendLog($("<div/>").text(jsonData.KEY_B));
    // appendLog($("<div/>").text(jsonData.KEY_SELECT));
    // appendLog($("<div/>").text(jsonData.KEY_START));
    // appendLog($("<div/>").text(jsonData.KEY_UP));
    // appendLog($("<div/>").text(jsonData.KEY_DOWN));
    // appendLog($("<div/>").text(jsonData.KEY_LEFT));
    // appendLog($("<div/>").text(jsonData.KEY_RIGHT));

    if (jsonData.from == "1") {
        nes.keyboard.updateKEY_A(Number(jsonData.KEY_A));
        nes.keyboard.updateKEY_B(Number(jsonData.KEY_B));
        nes.keyboard.updateKEY_SELECT(Number(jsonData.KEY_SELECT));
        nes.keyboard.updateKEY_START(Number(jsonData.KEY_START));
        nes.keyboard.updateKEY_UP(Number(jsonData.KEY_UP));
        nes.keyboard.updateKEY_DOWN(Number(jsonData.KEY_DOWN));
        nes.keyboard.updateKEY_LEFT(Number(jsonData.KEY_LEFT));
        nes.keyboard.updateKEY_RIGHT(Number(jsonData.KEY_RIGHT));
        appendLog($("<div/>").text("玩家"+jsonData.from+"按键设置加载完毕"));
    } else if (jsonData.from == "2") {
        nes.keyboard.updateKEY_A2(Number(jsonData.KEY_A));
        nes.keyboard.updateKEY_B2(Number(jsonData.KEY_B));
        nes.keyboard.updateKEY_SELECT2(Number(jsonData.KEY_SELECT));
        nes.keyboard.updateKEY_START2(Number(jsonData.KEY_START));
        nes.keyboard.updateKEY_UP2(Number(jsonData.KEY_UP));
        nes.keyboard.updateKEY_DOWN2(Number(jsonData.KEY_DOWN));
        nes.keyboard.updateKEY_LEFT2(Number(jsonData.KEY_LEFT));
        nes.keyboard.updateKEY_RIGHT2(Number(jsonData.KEY_RIGHT));
    } else {
        appendLog($("<div/>").text("error"));
    }
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
    $("#ready").attr("disabled", true);
    disableButtons(true);
}

function keyboard2(jsonData) {
    appendLog($("<div/>").text("keyboard 本地时间: "+getTime()+" 本地服务器时间: "+trueTime()+" 服务器时间: "+jsonData.time));
    // appendLog($("<div/>").text(jsonData.keyCode+": "+value));

    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_A.to));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_B));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_SELECT));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_START));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_UP));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_DOWN));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_LEFT));
    // appendLog($("<div/>").text(nes.keyboard.key2Setting.KEY_RIGHT));
    if (jsonData.from == "1") {
        switch (Number(jsonData.keyCode)) {
            case nes.keyboard.key1Setting.KEY_A: nes.keyboard.state1[nes.keyboard.keys.KEY_A] = Number(jsonData.value); break;     // Num-7
            case nes.keyboard.key1Setting.KEY_B: nes.keyboard.state1[nes.keyboard.keys.KEY_B] = Number(jsonData.value); break;     // Num-9
            case nes.keyboard.key1Setting.KEY_SELECT: nes.keyboard.state1[nes.keyboard.keys.KEY_SELECT] = Number(jsonData.value); break; // Num-3
            case nes.keyboard.key1Setting.KEY_START: nes.keyboard.state1[nes.keyboard.keys.KEY_START] = Number(jsonData.value); break;  // Num-1
            case nes.keyboard.key1Setting.KEY_UP: nes.keyboard.state1[nes.keyboard.keys.KEY_UP] = Number(jsonData.value); break;    // Num-8
            case nes.keyboard.key1Setting.KEY_DOWN: nes.keyboard.state1[nes.keyboard.keys.KEY_DOWN] = Number(jsonData.value); break;   // Num-2
            case nes.keyboard.key1Setting.KEY_LEFT: nes.keyboard.state1[nes.keyboard.keys.KEY_LEFT] = Number(jsonData.value); break;  // Num-4
            case nes.keyboard.key1Setting.KEY_RIGHT: nes.keyboard.state1[nes.keyboard.keys.KEY_RIGHT] = Number(jsonData.value); break; // Num-6
        }
    } else if (jsonData.from == "2") {
        switch (Number(jsonData.keyCode)) {
            case nes.keyboard.key2Setting.KEY_A: nes.keyboard.state2[nes.keyboard.keys.KEY_A] = Number(jsonData.value); break;     // Num-7
            case nes.keyboard.key2Setting.KEY_B: nes.keyboard.state2[nes.keyboard.keys.KEY_B] = Number(jsonData.value); break;     // Num-9
            case nes.keyboard.key2Setting.KEY_SELECT: nes.keyboard.state2[nes.keyboard.keys.KEY_SELECT] = Number(jsonData.value); break; // Num-3
            case nes.keyboard.key2Setting.KEY_START: nes.keyboard.state2[nes.keyboard.keys.KEY_START] = Number(jsonData.value); break;  // Num-1
            case nes.keyboard.key2Setting.KEY_UP: nes.keyboard.state2[nes.keyboard.keys.KEY_UP] = Number(jsonData.value); break;    // Num-8
            case nes.keyboard.key2Setting.KEY_DOWN: nes.keyboard.state2[nes.keyboard.keys.KEY_DOWN] = Number(jsonData.value); break;   // Num-2
            case nes.keyboard.key2Setting.KEY_LEFT: nes.keyboard.state2[nes.keyboard.keys.KEY_LEFT] = Number(jsonData.value); break;  // Num-4
            case nes.keyboard.key2Setting.KEY_RIGHT: nes.keyboard.state2[nes.keyboard.keys.KEY_RIGHT] = Number(jsonData.value); break; // Num-6
        }
    }
}

function keyboard(jsonData) {
    if (trueTime() > Number(jsonData.time)) {
        keyboard2(jsonData);
    } else {
        var delay = Number(jsonData.time) - trueTime();
        appendLog($("<div/>").text("wait: "+delay+" 本地时间: "+getTime()+" 本地服务器时间: "+trueTime()+" 服务器时间: "+jsonData.time));
        setTimeout(keyboard2, delay, jsonData);
    }
}
function unbindButton() {
    $("#canvas").
        unbind('keydown').
        unbind('keyup').
        unbind('keypress');
}

function bindLocal() {
    $("#canvas").
        unbind('keydown').
        unbind('keyup').
        unbind('keypress');
    $("#canvas").
        bind('keydown', function(evt) {
            self.nes.keyboard.keyDown(evt);
        }).
        bind('keyup', function(evt) {
            self.nes.keyboard.keyUp(evt);
        }).
        bind('keypress', function(evt) {
            self.nes.keyboard.keyPress(evt);
        });
}

function bindNetwork(jsonData) {
    unbindButton();
    $("#canvas").
        bind('keydown', function(evt) {
            // alert(evt.keyCode)
            // if (jsonData.to=="1") {
            //     self.nes.keyboard.keyDown1(evt);
            // } else if (jsonData.to=="2") {
            //     self.nes.keyboard.keyDown2(evt);
            // }
            // appendLog($("<div/>").text(evt.keyCode));
            // alert(keyCode)
            conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "65"}));
        }).
        bind('keyup', function(evt) {
            // alert(evt.keyCode)
            // if (jsonData.to=="1") {
            //     self.nes.keyboard.keyUp1(evt);
            // } else if (jsonData.to=="2") {
            //     self.nes.keyboard.keyUp2(evt);
            // }
            
            // alert(evt.keyCode)
            // appendLog($("<div/>").text(evt.keyCode));
            conn.send(JSON.stringify({"opt": "keyboard", "keyCode": evt.keyCode.toString(), "value": "64"}));
        }).
        bind('keypress', function(evt) {
            self.nes.keyboard.keyPress(evt);
        });
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

function getTime() {
    var myDate = new Date();
    return myDate.getTime();
}

function trueTime() {
    var myDate = new Date();
    return myDate.getTime()+dtime;
}

function startGame() {
    nes.reloadRom();
    self.nes.start();
    appendLog($("<div/>").text("你可以开始游戏了"));
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
                ip = jsonData.data
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
                start = 0;
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
                if (noPair == "2") {
                    $("#1-keyboard").hide();
                    $("#2-keyboard").show();
                    $("#leavePair").attr("disabled", false);
                    $("#ready").attr("disabled", false);
                    loadRom(jsonData.url, true);
                    appendLog($("<div/>").text("加载游戏"+jsonData.url));
                }
                appendLog($("<div/>").text(jsonData.ip+"来到了双人房"+jsonData.roomName));
                break; 
            case "buttonSetPair":
                disableButtons(true);
                loadRom(jsonData.url, false);
                appendLog($("<div/>").text("正在加载玩家"+jsonData.from+"按键设置..."));
                loadButtonSet2(jsonData);
                unbindButton(jsonData);
                conn.send(JSON.stringify({"opt": "checkTime1"}));
                break;
            case "checkTime1":
                // appendLog($("<div/>").text("正在与服务器校对时间..."));
                // $('#time').text(jsonData.s1);
                time1 = getTime();
                // $('#localTime').text(time1);
                conn.send(JSON.stringify({"opt": "checkTime2", "from": jsonData.from, "to":jsonData.to, "s1":jsonData.s1}));
                break;
            case "checkTime2":
                dtime = Number(jsonData.time) - time1;
                appendLog($("<div/>").text("相对时间: "+dtime));
                appendLog($("<div/>").text("时间校对完毕"));
                bindNetwork(jsonData);
                appendLog($("<div/>").text("服务器时间: "+jsonData.time));
                appendLog($("<div/>").text("本地时间: "+time1));
                time2 = getTime();
                $('#ping').text(jsonData.ping);
                $('#time').text(time2 + dtime);
                $('#localTime').text();
                if (start==0) {
                    conn.send(JSON.stringify({"opt": "checkTimeOK"}));
                }
                break;
            case "startPair":
                start = 1;
                appendLog($("<div/>").text("同步游戏中..."));
                i=0;
                if (trueTime() > Number(jsonData.time)) {
                    startGame();
                } else {
                    setTimeout(startGame(), Number(jsonData.time) - trueTime());
                }
                break;
            case "keyboard":
                keyboard(jsonData);
                break;
            default: 
                // appendLog($("<div/>").text(jsonData.data));
                break;
        } 
    }
} else {
    appendLog($("<div><b>Your browser does not support WebSockets.</b></div>"))
}