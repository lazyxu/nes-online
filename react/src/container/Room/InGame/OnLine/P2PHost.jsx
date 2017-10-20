import React from 'react'
import { connect } from 'react-redux'

import jsnes from '../../../../jsnes/index.js'
import ws from '../../../../websocket/index.js'
import constant from '../../../../constant.js'

class Controller extends React.Component {

  constructor(props) {
    super(props)
    this.pc = null
    this.dataChannel = null
  }

  componentWillMount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '正在尝试p2p连接，请等待')
    ws.addOnmessage('protocolSwitch', data => {
      this.props.addMsg(constant.MSG_FROM_SYSTEM, 'p2p连接失败, 自动调整为websocket模式')
      if (this.checkPeerCoonInterval != null) {
        clearInterval(this.checkPeerCoonInterval)
      }
      ws.addOnmessage('operation', data => {
        this.receivedLog[data.id][data.frameCount - this.state.frameCount] = data.operation
      })
      this.send = ws.send
      this.start()
    })
    var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    this.pc = new PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] })
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
        this.props.onmessage(JSON.parse(event.data))
      }
      this.dataChannel.onclose = (event) => {
        console.log("receiveChannel closed")
      }
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, 'p2p连接失败')
  }

  render() {
    return (
      <div />
    )
  }
}

export default Controller