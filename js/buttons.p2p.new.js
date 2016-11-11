document.body.style.webkitUserSelect='none'; 

// document.addEventListener("touchmove",function() {
//     event.preventDefault();//阻止触摸时浏览器的缩放、滚动条滚动
// }, false);
// document.addEventListener("touchstart",function() {
//     event.preventDefault();//阻止触摸时浏览器的缩放、滚动条滚动
// }, false);
// document.addEventListener("touchend",function() {
//     event.preventDefault();//阻止触摸时浏览器的缩放、滚动条滚动
// }, false);
function activeButtons(noPair) {
    document.getElementById('button_up').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_UP] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_UP, "value": 65}));
        document.getElementById('button_up').style.background = "url('/images/m/button_up_over.png')";
    }, false);
    document.getElementById('button_up').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_UP] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_UP, "value": 64}));
        document.getElementById('button_up').style.background = "url('/images/m/button_up.png')";
    }, false);

    document.getElementById('button_down').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_DOWN] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_DOWN, "value": 65}));
        document.getElementById('button_down').style.background = "url('/images/m/button_down_over.png')";
    }, false);
    document.getElementById('button_down').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_DOWN] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_DOWN, "value": 64}));
        document.getElementById('button_down').style.background = "url('/images/m/button_down.png')";
    }, false);

    document.getElementById('button_left').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_LEFT] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_LEFT, "value": 65}));
        document.getElementById('button_left').style.background = "url('/images/m/button_left_over.png')";
    }, false);
    document.getElementById('button_left').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_LEFT] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_LEFT, "value": 64}));
        document.getElementById('button_left').style.background = "url('/images/m/button_left.png')";
    }, false);

    document.getElementById('button_right').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_RIGHT] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_RIGHT, "value": 65}));
        document.getElementById('button_right').style.background = "url('/images/m/button_right_over.png')";
    }, false);
    document.getElementById('button_right').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_RIGHT] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_RIGHT, "value": 64}));
        document.getElementById('button_right').style.background = "url('/images/m/button_right.png')";
    }, false);

    document.getElementById('button_a').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_A] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_A, "value": 65}));
        document.getElementById('button_a').style.background = "url('/images/m/button_a_over.png')";
    }, false);
    document.getElementById('button_a').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_A] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_A, "value": 64}));
        document.getElementById('button_a').style.background = "url('/images/m/button_a.png')";
    }, false);

    document.getElementById('button_b').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_B] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_B, "value": 65}));
        document.getElementById('button_b').style.background = "url('/images/m/button_b_over.png')";
    }, false);
    document.getElementById('button_b').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_B] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_B, "value": 64}));
        document.getElementById('button_b').style.background = "url('/images/m/button_b.png')";
    }, false);

    document.getElementById('button_select').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_SELECT] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_SELECT, "value": 65}));
        document.getElementById('button_select').style.background = "url('/images/m/r_button_select_over.png')";
    }, false);
    document.getElementById('button_select').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_SELECT] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_SELECT, "value": 64}));
        document.getElementById('button_select').style.background = "url('/images/m/r_button_select.png')";
    }, false);

    document.getElementById('button_start').addEventListener("touchstart",function(){
        event.preventDefault();
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_START] = 65;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_START, "value": 65}));
        document.getElementById('button_start').style.background = "url('/images/m/r_button_start_over.png')";
    }, false);
    document.getElementById('button_start').addEventListener("touchend",function(){
        if (noPair==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_START] = 64;
        else if (noPair==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_START, "value": 64}));
        document.getElementById('button_start').style.background = "url('/images/m/r_button_start.png')";
    }, false);
}
activeButtons(1);


$("#msg_name").focus();

$("#input_name").submit(function() {
    var msg = $("#msg_name");
    if (!conn) {
        return false;
    }
    if (!msg.val()) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "name", "data": msg.val()}));
    $("#input_name").hide();
    return false;
});

$("#chat").submit(function() {
    if (!conn) {
        return false;
    }
    if (!msg.val()) {
        return false;
    }
    conn.send(JSON.stringify({"opt": "msg", "data": msg.val()}));
    msg.val("");
    $("#chat").hide();
    return false;
});

document.getElementById('button_chat').onclick = function() {
    if ($("#chat").is(":hidden")) {
        $("#chat").show();
        $("#msg").focus();
    } else {
        $("#chat").hide();
    }
}

document.getElementById('button_show_menus').onclick = function() {
    if ($("#button_menus").is(":hidden")) {
        $("#button_menus").show();
    } else {
        $("#button_menus").hide();
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
