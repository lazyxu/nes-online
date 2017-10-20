import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../constant.js'
import ws from '../../../../websocket/index.js'
import operation from './operation.js'
import peerConnection from './peerConnection.js'
import P2PHost from './P2PHost.jsx'
import P2PClient from './P2PClient.jsx'
import WSClient from './WSClient.jsx'
import Screen from './Screen.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props)
    this.PEER_CONNECTION = 0
    this.WEBSOCKET = 1
    this.state = {
      connectionType: this.PEER_CONNECTION,
      chaseFrame: 0,
    }
    this.delay = 5
    this.localLog = []
    this.addOperation = null
  }

  action(op) {
    if (op == -1) {
      return
    }
    // console.log(op.toString(2))
    var frameCount = operation.frameCount(op)
    var id = operation.id(op)
    var command = operation.command(op)
    var state = operation.state(op)
    if (command >= operation.COMMAND_BUTTON_BEGIN && command <= operation.COMMAND_BUTTON_END) {
      state ? this.props.nes.buttonDown(id + 1, command) : this.props.nes.buttonUp(id + 1, command)
      console.log('user ' + this.props.id_in_room + ' ' + command + ' ' + state + ' in' + this.state.frameCount)
    }
  }

  componentWillMount() {
    ws.addOnmessage('protocolSwitch', data => {
      this.setState({ connectionType: this.WEBSOCKET })
    })
  }

  componentDidMount() {
    ws.send({
      type: 'protocolSwitch',
      connectionType: this.WEBSOCKET,
    })
  }

  componentWillUnmount() {
    ws.removeOnmessage('protocolSwitch')
  }

  setOnFrame(func) {
    this.props.nes.opts.onFrame = func
  }

  setChaseFrame(frame) {
    this.setState({chaseFrame: frame})
  }

  render() {
    return (
      <div>
        <WSClient
          room={this.props.room}
          id_in_room={this.props.id_in_room}
          controller={this.props.controller}
          action={this.action.bind(this)}
          nes={this.props.nes}
          keyboard={this.props.keyboard}
          addMsg={this.props.addMsg}
          isRunning={this.props.isRunning}
          setChaseFrame={this.setChaseFrame.bind(this)}
        />
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
          chaseFrame={this.state.chaseFrame}
        />
      </div>
    )
  }
}

export default Emulator;