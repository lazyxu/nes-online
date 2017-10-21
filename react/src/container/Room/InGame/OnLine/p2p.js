import ws from '../../../../utils/websocket/index.js'

var P2P = function () {
  var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
  this.pc = new PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] })
  this.dataChannel = null
  //发送ICE候选到其他客户端
  this.pc.onicecandidate = (event) => {
    ws.send({
      "type": "__ice_candidate",
      "candidate": event.candidate
    })
  }
  ws.addOnmessage("__ice_candidate", data => {
    console.log(data)
    if (data.candidate != null) {
      var mid = new RTCIceCandidate(data.candidate)
      this.pc.addIceCandidate(mid)
    }
  })
  this.handler = {}
}

P2P.CONNECTED = 0
P2P.CONNECTING = 1
P2P.FAILED = 2

var wsHandler = {}

P2P.prototype = {
  createHost: function () {
    this.dataChannel = this.pc.createDataChannel("nes online")
    console.log("createDataChannel")
    this.pc.createOffer().then(offer => {
      return this.pc.setLocalDescription(offer)
    }).then(() => {
      ws.send({
        "type": "__offer",
        "sdp": this.pc.localDescription
      })
    })
    this.dataChannel.onopen = (event) => {
      console.log("dataChannel open")
    }
    this.dataChannel.onmessage = (event) => {
      var json = JSON.parse(event.data)
      for (var type in this.handler) {
        if (json.type == type)
          this.handler[type](json)
      }
    }
    this.dataChannel.onclose = (event) => {
      console.log("dataChannel closed")
    }
    ws.addOnmessage("__answer", data => {
      var mid = new RTCSessionDescription(data.sdp)
      this.pc.setRemoteDescription(mid)
    })
  },

  createClient: function () {
    ws.addOnmessage("__offer", data => {
      var mid = new RTCSessionDescription(data.sdp)
      this.pc.setRemoteDescription(mid)
      this.pc.createAnswer().then(answer => {
        return this.pc.setLocalDescription(answer)
      }).then(() => {
        ws.send({
          "type": "__answer",
          "sdp": this.pc.localDescription
        })
      })
    })
    console.log("ondatachannel")
    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.dataChannel.onopen = (event) => {
        console.log("receiveChannel start")
      }
      this.dataChannel.onmessage = (event) => {
        var json = JSON.parse(event.data)
        for (var type in this.handler) {
          if (json.type == type)
            this.handler[type](json)
        }
      }
      this.dataChannel.onclose = (event) => {
        console.log("receiveChannel closed")
      }
    }
  },

  send: function (data) {
    this.dataChannel.send(JSON.stringify(data))
  },

  addOnmessage: function (type, handler) {
    console.log('delete ' + type)
    this.handler[type] = handler
  },

  removeOnmessage: function (type) {
    console.log('delete ' + type)
    delete this.handler[type]
  },

  getState: function () {
    var state = this.pc.iceConnectionState
    if ((state == "completed" || state == "connected") && this.dataChannel.readyState == "open") {
      return P2P.CONNECTED
    }
    if (state == "failed" || state == "closed") {
      return P2P.FAILED
    }
    return P2P.CONNECTING
  },

  close: function () {
    this.dataChannel.close()
    this.pc.close()
  }
}

module.exports = P2P