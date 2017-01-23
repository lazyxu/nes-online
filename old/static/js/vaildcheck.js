var loadRomInterval1;
var loadRomInterval2;

var loadRomInterval5;
function checkVaild(path) {
        var loadRomInterval3;
        loadRomInterval3 = setInterval(function() {
            if ( document.getElementById("loaded").innerHTML == "false" || document.getElementById("isVaild").innerHTML == "false" || document.getElementById("runOK").innerHTML != ""|| document.getElementById("crashed").innerHTML == "true") {
                try {
                    if (
                        document.getElementById("loaded").innerHTML == "false" ||
                        document.getElementById("isVaild").innerHTML == "false" ||
                        document.getElementById("runOK").innerHTML == "false" ||
                        document.getElementById("next").innerHTML == "true" ||
                        document.getElementById("crashed").innerHTML == "true"
                        ) {
                        conn.send(JSON.stringify({"Handle": "InvaildRom", "filePath": path}));
                        appendChat("invaild ROM!");
                    }
                    document.getElementById("loaded").innerHTML = ""
                    document.getElementById("isVaild").innerHTML = ""
                    document.getElementById("runOK").innerHTML = ""
                    document.getElementById("next").innerHTML = ""
                    document.getElementById("crashed").innerHTML = ""
                    temp_index++;
                } finally {
                    clearInterval(loadRomInterval3);
                    delete loadRomInterval3;
                }
            }
        }, 10)
}
function checkx(temp_index) {
        var t = document.getElementById(temp_index)
        if (t==null)
            return
        document.getElementById("index").innerHTML = temp_index;
        document.getElementById("index_name").innerHTML = document.getElementById(temp_index).innerHTML;
        loadRom(t.innerHTML)
        var loadRomInterval3;
        loadRomInterval3 = setInterval(function() {
            if ( document.getElementById("loaded").innerHTML == "false" || document.getElementById("isVaild").innerHTML == "false" || document.getElementById("runOK").innerHTML != ""|| document.getElementById("crashed").innerHTML == "true") {
                try {
                    if (
                        document.getElementById("loaded").innerHTML == "false" ||
                        document.getElementById("isVaild").innerHTML == "false" ||
                        document.getElementById("runOK").innerHTML == "false" ||
                        document.getElementById("next").innerHTML == "true" ||
                        document.getElementById("crashed").innerHTML == "true"
                        ) {
                        conn.send(JSON.stringify({"Handle": "InvaildRom", "filePath": document.getElementById(temp_index).innerHTML}));
                        appendChat(document.getElementById(temp_index).innerHTML+" is invaild. ");
                        appendChat("; rom loaded: "+document.getElementById("loaded").innerHTML);
                        appendChat("; rom is vaild: "+document.getElementById("isVaild").innerHTML);
                        appendChat("; fps = 0: "+document.getElementById("runOK").innerHTML);
                        appendChat("; t = null: "+document.getElementById("next").innerHTML);
                        appendChat("; invaild operator: "+document.getElementById("crashed").innerHTML);
                    }
                    document.getElementById("loaded").innerHTML = ""
                    document.getElementById("isVaild").innerHTML = ""
                    document.getElementById("runOK").innerHTML = ""
                    document.getElementById("next").innerHTML = ""
                    document.getElementById("crashed").innerHTML = ""
                    temp_index++;
                } finally {
                    clearInterval(loadRomInterval3);
                    delete loadRomInterval3;
                    setTimeout(function() {
                        checkx(temp_index);
                    }, 10);
                }
            }
        }, 10)
}
// document.getElementById("check").onclick = function(){
//     checkx($("#start").val());
// }
