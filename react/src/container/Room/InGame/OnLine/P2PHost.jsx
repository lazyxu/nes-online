import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../constant.js'
import ws from '../../../../websocket/index.js'
import Controller from './Controller.jsx'
import FrameInterval from './FrameInterval.jsx'
import P2P from './p2p.js'
import operation from './operation.js'

class P2PHost extends React.Component {

  constructor(props) {
    super(props)
    this.p2p = null
    this.operationTemp = new Array(this.props.room.player_count)
    for (var i = 0; i < this.operationTemp.length; i++) {
      this.operationTemp[i] = new Array(0)
    }
    this.onReceive = function () { }
    this.sendOperationsInterval = null
    this.frameID = 0
  }

  addOperation(command, state) {
    this.operationTemp[0].push(
      operation.encode(
        0,
        this.props.id_in_room,
        command,
        state
      )
    )
  }

  setOnReceive(func) {
    this.onReceive = func
  }

  componentWillMount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '正在尝试p2p连接，请等待')
    try {
      this.p2p = new P2P()
      this.p2p.createHost()
      this.p2p.addOnmessage('operation', data => {
        this.operationTemp[1].push(data.operation)
      })
      var count = 0
      this.checkPeerCoonInterval = setInterval(
        () => {
          var state = this.p2p.getState()
          if (count < 10 && state == P2P.CONNECTING) {
            count++
            return
          }
          if (state == P2P.CONNECTED) {
            clearInterval(this.checkPeerCoonInterval)
            this.start()
          } else {
            clearInterval(this.checkPeerCoonInterval)
            ws.send({
              type: 'protocolSwitch',
              connectionType: constant.CONNECTION_TYPE_WEB_SOCKET,
            })
          }
        },
        500
      )
    } catch (err) {
      ws.send({
        type: 'protocolSwitch',
        connectionType: constant.CONNECTION_TYPE_WEB_SOCKET,
      })
    }
  }

  start() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, 'p2p连接成功')
    this.sendOperationsInterval = setInterval(
      () => {
        var data = {
          type: "operationTemp",
          frameID: this.frameID,
          operation: this.operationTemp.slice(0),
        }
        for (var i = 0; i < this.operationTemp.length; i++) {
          this.operationTemp[i] = new Array(0)
        }
        this.p2p.send(data)
        this.onReceive(data)
        this.frameID += 2
      }
      , 1000 / 25
    )
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, 'p2p连接失败')
    this.p2p.removeOnmessage('operation')
    clearInterval(this.sendOperationsInterval)
  }

  addOnmessage(type, handler) {
    this.p2p.addOnmessage(type, handler)
  }

  removeOnmessage(type) {
    this.p2p.removeOnmessage(type)
  }

  render() {
    return (
      <div>
        <Controller
          id_in_room={this.props.id_in_room}
          nes={this.props.nes}
          keyboard={this.props.keyboard}
          addOperation={this.addOperation.bind(this)}
        />
        <FrameInterval
          nes={this.props.nes}
          addOnmessage={this.addOnmessage.bind(this)}
          removeOnmessage={this.removeOnmessage.bind(this)}
          addMsg={this.props.addMsg}
          isRunning={this.props.isRunning}
          frameID={this.props.frameID}
          addFrameID={this.props.addFrameID}
          setOnReceive={this.setOnReceive.bind(this)}
        />
      </div>
    )
  }
}

export default P2PHost