import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../utils/constant.js'
import ws from '../../../../utils/websocket/index.js'
import jsnes from '../../../../utils/jsnes/index.js'
import Screen from './Screen.jsx'
import operation from './operation.js'

class FrameInterval extends React.Component {

  constructor(props) {
    super(props)
    this.frameInterval = null
    this.state = {
      chaseFrame: 0,
    }
  }

  componentWillMount() {
    this.receivedLog = new Array()
    this.props.setOnReceive(data => {
      if (data.operation[0].length!=0) {
        console.log(data)
      }
      if (data.operation[1].length!=0) {
        console.log(data)
      }
      this.receivedLog[data.frameID - this.props.frameID] = data.operation
    })
  }

  componentDidMount() {
    this.start()
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  action(op) {
    var frameCount = operation.frameCount(op)
    var id = operation.id(op)
    var command = operation.command(op)
    var state = operation.state(op)
    if (command >= operation.COMMAND_BUTTON_BEGIN && command <= operation.COMMAND_BUTTON_END) {
      state ? this.props.nes.buttonDown(id + 1, command) : this.props.nes.buttonUp(id + 1, command)
    }
  }

  start() {
    var waitingCount = 0
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '游戏开始')
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        if (this.props.frameID & 1) {
          this.props.nes.frame()
          this.props.addFrameID()
          this.receivedLog.shift()
        } else {
          this.setState({chaseFrame: this.receivedLog.length / 4})
          if (typeof this.receivedLog[0] === 'undefined') {
            waitingCount++
            if (waitingCount >= 60) {
              waitingCount -= 60
              this.props.addMsg(constant.MSG_FROM_SYSTEM, '还没收到第' + this.props.frameID + '帧的数据')
            }
            return
          }
          waitingCount = 0
          for (var i = 0; i < this.receivedLog[0].length; i++) {
            for (var j = 0; j < this.receivedLog[0][i].length; j++) {
              this.action(this.receivedLog[0][i][j])
            }
          }
          this.receivedLog.shift()

          this.props.nes.frame()
          this.props.addFrameID()
        }
      }
    }, 1000 / 60)
  }

  setChaseFrame(frame) {
    this.setState({chaseFrame: frame})
  }

  setOnFrame(func) {
    this.props.nes.opts.onFrame = func
  }

  render() {
    return (
      <Screen
        setOnFrame={this.setOnFrame.bind(this)}
        chaseFrame={this.state.chaseFrame}
        frameID={this.props.frameID}
      />
    )
  }
}

export default FrameInterval