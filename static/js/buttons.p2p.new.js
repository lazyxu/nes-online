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
function activeButtons(RoomPlayerNO) {
    document.getElementById('button_up').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_UP] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_UP, "value": 65}));
        document.getElementById('button_up').style.background = "url('/images/m/button_up_over.png')";
    }, false);
    document.getElementById('button_up').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_UP] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_UP, "value": 64}));
        document.getElementById('button_up').style.background = "url('/images/m/button_up.png')";
    }, false);

    document.getElementById('button_down').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_DOWN] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_DOWN, "value": 65}));
        document.getElementById('button_down').style.background = "url('/images/m/button_down_over.png')";
    }, false);
    document.getElementById('button_down').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_DOWN] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_DOWN, "value": 64}));
        document.getElementById('button_down').style.background = "url('/images/m/button_down.png')";
    }, false);

    document.getElementById('button_left').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_LEFT] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_LEFT, "value": 65}));
        document.getElementById('button_left').style.background = "url('/images/m/button_left_over.png')";
    }, false);
    document.getElementById('button_left').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_LEFT] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_LEFT, "value": 64}));
        document.getElementById('button_left').style.background = "url('/images/m/button_left.png')";
    }, false);

    document.getElementById('button_right').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_RIGHT] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_RIGHT, "value": 65}));
        document.getElementById('button_right').style.background = "url('/images/m/button_right_over.png')";
    }, false);
    document.getElementById('button_right').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_RIGHT] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_RIGHT, "value": 64}));
        document.getElementById('button_right').style.background = "url('/images/m/button_right.png')";
    }, false);

    document.getElementById('button_a').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_A] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_A, "value": 65}));
        document.getElementById('button_a').style.background = "url('/images/m/button_a_over.png')";
    }, false);
    document.getElementById('button_a').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_A] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_A, "value": 64}));
        document.getElementById('button_a').style.background = "url('/images/m/button_a.png')";
    }, false);

    document.getElementById('button_b').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_B] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_B, "value": 65}));
        document.getElementById('button_b').style.background = "url('/images/m/button_b_over.png')";
    }, false);
    document.getElementById('button_b').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_B] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_B, "value": 64}));
        document.getElementById('button_b').style.background = "url('/images/m/button_b.png')";
    }, false);

    document.getElementById('button_a_turbo').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_X] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_X, "value": 65}));
        document.getElementById('button_a_turbo').style.background = "url('/images/m/button_a_turbo_over.png')";
    }, false);
    document.getElementById('button_a_turbo').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_X] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_X, "value": 64}));
        document.getElementById('button_a_turbo').style.background = "url('/images/m/button_a_turbo.png')";
    }, false);

    document.getElementById('button_b_turbo').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_Y] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_Y, "value": 65}));
        document.getElementById('button_b_turbo').style.background = "url('/images/m/button_b_turbo_over.png')";
    }, false);
    document.getElementById('button_b_turbo').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_Y] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.CHATstringify({"keyCode": nes.keyboard.key2Setting.KEY_Y, "value": 64}));
        document.getElementById('button_b_turbo').style.background = "url('/images/m/button_b_turbo.png')";
    }, false);

    document.getElementById('button_select').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_SELECT] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_SELECT, "value": 65}));
        document.getElementById('button_select').style.background = "url('/images/m/r_button_select_over.png')";
    }, false);
    document.getElementById('button_select').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_SELECT] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_SELECT, "value": 64}));
        document.getElementById('button_select').style.background = "url('/images/m/r_button_select.png')";
    }, false);

    document.getElementById('button_start').addEventListener("touchstart",function(){
        event.preventDefault();
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_START] = 65;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_START, "value": 65}));
        document.getElementById('button_start').style.background = "url('/images/m/r_button_start_over.png')";
    }, false);
    document.getElementById('button_start').addEventListener("touchend",function(){
        if (RoomPlayerNO==1)
            nes.keyboard.state1[nes.keyboard.keys.KEY_START] = 64;
        else if (RoomPlayerNO==2)
            dataChannel.send(JSON.stringify({"keyCode": nes.keyboard.key2Setting.KEY_START, "value": 64}));
        document.getElementById('button_start').style.background = "url('/images/m/r_button_start.png')";
    }, false);
}
activeButtons(1);


$("#msg").focus();

$("#input_name").submit(function() {
    var msg = $("#msg_name");
    if (!conn) {
        return false;
    }
    if (!msg.val()) {
        return false;
    }
    conn.send(JSON.stringify({"Handle": "Rename", "NewName": msg.val()}));
    $("#input_name").hide();
    msg.val("");
    $("#msg").focus();
    return false;
});

$("#chat").submit(function() {
    if (!msg.val()) {
        return false;
    }
    conn.send(JSON.stringify({"Handle": chatPos, "Msg": msg.val()}));
    msg.val("");
    return false;
});
document.getElementById('rename').onclick = function() {
    if ($("#input_name").is(":hidden")) {
        $("#input_name").show();
        $("#msg_name").focus();
    } else {
        $("#input_name").hide();
    }
}
document.getElementById('button_chat').onclick = function() {
    if ($("#Chat").is(":hidden")) {
        $("#Chat").show();
        $("#msg").focus();
    } else {
        $("#Chat").hide();
    }
}
var HallChat = true, RoomChat = true;
document.getElementById('HallChat').onclick = function() {
    chatPos = "Msg";
    HallChat = !HallChat;
    if (HallChat) {
        document.getElementById('HallChat').style.background = "url('/images/m/checkbox_sel.png')";
        if (!RoomChat) {
            $("#info").show();
            $("#room_chat").hide();
            $("#room_chat").hide();
        } else {
            $("#mixinfo").show();
            $("#info").hide();
            $("#room_chat").hide();
        }
    } else {
        document.getElementById('HallChat').style.background = "url('/images/m/checkbox_unsel.png')";
        if (RoomChat) {
            $("#room_chat").show();
            chatPos = "RoomMsg";
            $("#info").hide();
            $("#mixinfo").hide();
        } else {
            $("#info").hide();
            $("#room_chat").hide();
            $("#mixinfo").hide();
        }
    }
}
document.getElementById('RoomChat').onclick = function() {
    chatPos = "Msg";
    RoomChat = !RoomChat;
    if (RoomChat) {
        document.getElementById('RoomChat').style.background = "url('/images/m/checkbox_sel.png')";
        if (!HallChat) {
            $("#room_chat").show();
            chatPos = "RoomMsg";
            $("#info").hide();
            $("#mixinfo").hide();
        } else {
            $("#mixinfo").show();
            $("#info").hide();
            $("#room_chat").hide();
        }
    } else {
        document.getElementById('RoomChat').style.background = "url('/images/m/checkbox_unsel.png')";
        if (HallChat) {
            $("#info").show();
            $("#room_chat").hide();
            $("#mixinfo").hide();
        } else {
            $("#info").hide();
            $("#room_chat").hide();
            $("#mixinfo").hide();
        }
    }
}

document.getElementById('button_chat').onclick = function() {
    if ($("#Chat").is(":hidden")) {
        $("#Chat").show();
        $("#msg").focus();
    } else {
        $("#Chat").hide();
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

$("#form_rom_local").on("change","input[type='file']",function(){
    var filePath=$(this).val();
    if(filePath.indexOf("nes")!=-1 || filePath.indexOf("nes")!=-1){
        var arr=filePath.split('\\');
        var fileName=arr[arr.length-1];
        $("#rom_local_name").html(fileName);
    }else{
        $("#rom_local_name").html("你选择的不是nes的rom文件");
        return false 
    }
})

$("#form_rom_network").on("change","input[type='file']",function(){
    var filePath=$(this).val();
    if(filePath.indexOf("nes")!=-1 || filePath.indexOf("nes")!=-1){
        var arr=filePath.split('\\');
        var fileName=arr[arr.length-1];
        $("#rom_network_name").html(fileName);
    }else{
        $("#rom_network_name").html("你选择的不是nes的rom文件");
        return false 
    }
})

function uploadRom (modalID, id, network) {
    event.preventDefault();
    // appendChat("upload start!");
    // $.ajax({
    //     type: "POST",
    //     url: "/upload",
    //     data: new FormData(document.getElementById("form_upload_rom")),
    //     mimeType: "multipart/form-data",
    //     contentType: false,
    //     cache: false,
    //     processData: false,
    //     success: function () {
    //         appendChat("upload success!");
    //     },
    //     fail: function (jqXHR, textStatus, errorThrown) {
    //         appendChat("upload failed!"+jqXHR+textStatus+errorThrown);
    //     }
    // });
    var reader = new FileReader();
    var inputElement = document.getElementById(id);
    var fileList = inputElement.files;
    for ( var i = 0; i < fileList.length; i++) {
　　　   var reader = new FileReader();
        reader.readAsBinaryString(fileList[i]);
        if (network)
            createDoubleRoom(fileList[i].name);
        reader.onload = function loaded(evt) {
            var binaryString = evt.target.result;
            nes.loadRom(binaryString)
            nes.start();
            // appendChat("upload file"+i);
            // appendChat(binaryString);
            // appendChat(typeof(binaryString));
            // conn.send(JSON.stringify({
            //     "Handle": "UploadRom",
            //     "IP": IP,
            //     "Name": document.getElementById("name1").innerHTML,
            //     "ROM": binaryString
            // }));
        }
    }
    $(modalID).modal('hide');
};