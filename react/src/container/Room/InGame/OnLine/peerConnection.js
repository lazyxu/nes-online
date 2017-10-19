import ws from '../../../../websocket/index.js'

var peerConnection = function (idInRoom, onMessage) {
    var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    this.pc = new PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
    this.dataChannel = null
    //发送ICE候选到其他客户端
    this.pc.onicecandidate = (event) => {
        ws.send({
            "type": "__ice_candidate",
            "candidate": event.candidate
        });
    };
    ws.addOnmessage("__ice_candidate", data => {
        console.log(data);
        if (data.candidate != null) {
            var mid = new RTCIceCandidate(data.candidate);
            this.pc.addIceCandidate(mid);
        }
    })
    if (idInRoom == 0) {
        this.dataChannel = this.pc.createDataChannel("keyboard");
        console.log("createDataChannel");
        this.pc.createOffer().then(offer => {
            return this.pc.setLocalDescription(offer);
        }).then(() => {
            ws.send({
                "type": "__offer",
                "sdp": this.pc.localDescription
            });
        });
        this.dataChannel.onopen = (event) => {
            console.log("dataChannel open");
        }
        this.dataChannel.onmessage = (event) => {
            onMessage(JSON.parse(event.data));
        }
        this.dataChannel.onclose = (event) => {
            console.log("dataChannel closed");
        }
        ws.addOnmessage("__answer", data => {
            var mid = new RTCSessionDescription(data.sdp);
            this.pc.setRemoteDescription(mid);
        })
    } else {
        ws.addOnmessage("__offer", data => {
            var mid = new RTCSessionDescription(data.sdp);
            this.pc.setRemoteDescription(mid);
            this.pc.createAnswer().then(answer => {
                return this.pc.setLocalDescription(answer);
            }).then(() => {
                ws.send({
                    "type": "__answer",
                    "sdp": this.pc.localDescription
                });
            });
        })
        console.log("ondatachannel");
        this.pc.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.dataChannel.onopen = (event) => {
                console.log("receiveChannel start");
            }
            this.dataChannel.onmessage = (event) => {
                onMessage(JSON.parse(event.data));
            }
            this.dataChannel.onclose = (event) => {
                console.log("receiveChannel closed");
            }
        }
    }
}

peerConnection.CONNECTED = 0
peerConnection.CONNECTING = 1
peerConnection.FAILED = 2

peerConnection.prototype = {
    getState: function () {
        var state = this.pc.iceConnectionState
        if ((state == "completed" || state == "connected") && this.dataChannel.readyState == "open") {
            return peerConnection.CONNECTED
        }
        if (state == "failed" || state == "closed") {
            return peerConnection.FAILED
        }
        return peerConnection.CONNECTING
    },

    close: function () {
        this.dataChannel.close()
        this.pc.close()
    }
}

module.exports = peerConnection