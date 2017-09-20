function keyboardActionSet(data) {
  var frameCount = 0;
  if (typeof window.nes.frameCount=="undefined") {
    frameCount = 0;
  } else {
    frameCount = window.nes.frameCount;
  }
//   console.log(frameCount+":"+data.frameID+"--"+data.keyboard.length);
  for (var i=0; i<data.keyboard.length; i++)
    window.keyboardAction[data.idInRoom][data.frameID-frameCount+i] = data.keyboard[i];
}
function createPeerConnection() {
    var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    window.pc = new PeerConnection({"iceServers": [{"url": "stun:stun.l.google.com:19302"}]});
    //发送ICE候选到其他客户端
    pc.onicecandidate = function(event){
        window.ws.send(JSON.stringify({
            "type": "__ice_candidate",
            "candidate": event.candidate
        }));
    };
    window.wsHandler["__ice_candidate"] = (data)=>{
        console.log(data);
        if (data.candidate!=null){
            var mid = new RTCIceCandidate(data.candidate);
            pc.addIceCandidate(mid);
        }
    }
    var idInRoom = window.store.getState().user.idInRoom;
    if (idInRoom==0) {
        window.dataChannel = pc.createDataChannel("keyboard");
        console.log("createDataChannel");
        pc.createOffer().then(function(offer) {
            return pc.setLocalDescription(offer);
        }).then(function() {
            window.ws.send(JSON.stringify({
                "type": "__offer",
                "sdp": pc.localDescription
            }));
        });
        window.dataChannel.onopen = function(event) {
            console.log("dataChannel open");
        }
        window.dataChannel.onmessage = function(event) {
            var data=JSON.parse(event.data);
            keyboardActionSet(data);
        }
        window.dataChannel.onclose = function(event) {
            console.log("dataChannel closed");
        }
        window.wsHandler["__answer"] = (data)=>{
            var mid = new RTCSessionDescription(data.sdp);
            pc.setRemoteDescription(mid);
        }
    } else {
        window.wsHandler["__offer"] = (data)=>{
            var mid = new RTCSessionDescription(data.sdp);
            pc.setRemoteDescription(mid);
            pc.createAnswer().then(function(answer) {
                return pc.setLocalDescription(answer);
            }).then(function() {
                window.ws.send(JSON.stringify({
                    "type": "__answer",
                    "sdp": pc.localDescription
                }));
            });
        }
        pc.ondatachannel = function(event) {
            window.dataChannel = event.channel;
            window.dataChannel.onopen = function(event) {
                console.log("receiveChannel start");
            }
            window.dataChannel.onmessage = function(event) {
                var data=JSON.parse(event.data);
                keyboardActionSet(data);
            }
            window.dataChannel.onclose = function(event) {
                console.log("receiveChannel closed");
            }
        }
    }
}