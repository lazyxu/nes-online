import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../constant.js'
import ws from '../../../../websocket/index.js'
import jsnes from '../../../../jsnes/index.js'
import Controller from './Controller.jsx'
import operation from './operation.js'

class WSClient extends React.Component {

  constructor(props) {
    super(props)
    this.pc = null
    this.dataChannel = null
    this.delay = 5
    this.frameInterval = null
    this.state = {
      frameID: 0,
    }
  }

  addOperation(command, state) {
    ws.send({
      type: 'operation',
      operation: operation.encode(
        0,
        this.props.id_in_room,
        command,
        state
      ),
    })
  }

  componentWillMount() {
    this.receivedLog = new Array(this.delay)
    window.receivedLog = this.receivedLog
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '自动调整为websocket模式')
    ws.addOnmessage('operation', data => {
      this.receivedLog[data.frameID - this.state.frameID] = data.operation
    })
  }

  componentDidMount() {
    this.start()
  }

  start() {
    var waitingCount = 0
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '游戏开始')
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        if (this.state.frameID & 1) {
          this.props.nes.frame()
          this.setState({ frameID: this.state.frameID + 1 })
          this.receivedLog.shift()
        } else {
          this.props.setChaseFrame(this.receivedLog.length / 4)
          if (typeof this.receivedLog[0] === 'undefined') {
            waitingCount++
            if (waitingCount >= 60) {
              waitingCount -= 60
              this.props.addMsg(constant.MSG_FROM_SYSTEM, '还没收到第' + this.state.frameID + '帧的数据')
            }
            return
          }
          waitingCount = 0
          for (var i = 0; i < this.receivedLog[0].length; i++) {
            for (var j = 0; j < this.receivedLog[0][i].length; j++) {
              this.props.action(this.receivedLog[0][i][j])
            }
          }
          this.receivedLog.shift()

          this.props.nes.frame()
          this.setState({ frameID: this.state.frameID + 1 })
        }
      }
    }, 1000 / 60)
  }

  componentWillUnmount() {
    ws.removeOnmessage('operaion')
    clearInterval(this.frameInterval)
  }

  render() {
    return (
      <Controller
        id_in_room={this.state.id_in_room}
        controller={this.props.controller}
        nes={this.props.nes}
        keyboard={this.props.keyboard}
        addOperation={this.addOperation.bind(this)}
      />
    )
  }
}

export default WSClient