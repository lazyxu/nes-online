import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../utils/constant.js'
import ws from '../../../../utils/websocket/index.js'
import Controller from './Controller.jsx'
import FrameInterval from './FrameInterval.jsx'
import operation from './operation.js'

class WSClient extends React.Component {

  constructor(props) {
    super(props)
    this.onReceive = function () { }
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

  setOnReceive(func) {
    console.log("setOnReceive")
    console.log(this.onReceive)
    this.onReceive = func
    console.log(this.onReceive)
  }

  componentWillMount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '自动调整为websocket模式')
    ws.addOnmessage('operationTemp', data => {
      this.onReceive(data)
    })
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    ws.removeOnmessage('operationTemp')
  }

  addOnmessage(type, handler) {
  }

  removeOnmessage(type) {
    ws.removeOnmessage(type)
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

export default WSClient