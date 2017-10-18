import React from 'react'
import { connect } from 'react-redux'

import ws from '../../../../websocket/index.js'
import Controller from '../Common/Controller.jsx'
import operation from '../Common/operation.js'

import peerConnection from '../Common/peerConnection.js'

class Emulator extends React.Component {

  constructor(props) {
    super(props)
    this.frameInterval = null
    this.state = {
      frameCount: 0,
    }
    this.delay = 5
    this.localLog = []
    this.send = null
    this.receivedLog = new Array(this.props.room.player_count)
  }

  addOperation(command, state) {
    console.log('addOperation')
    console.log(this.state.frameCount + this.delay)
    console.log(command)
    console.log(state)
    this.localLog.push(operation.encode(
      this.state.frameCount + this.delay,
      this.props.id_in_room,
      command,
      state
    ))
  }

  action(op) {
    if (op == -1) {
      return
    }
    console.log(op.toString(2))
    var frameCount = operation.frameCount(op)
    var id = operation.id(op)
    var command = operation.command(op)
    var state = operation.state(op)
    if (command >= operation.COMMAND_BUTTON_BEGIN && command <= operation.COMMAND_BUTTON_END) {
      state ? this.props.nes.buttonDown(id + 1, command) : this.props.nes.buttonUp(id + 1, command)
      console.log('user ' + this.props.id_in_room + ' ' + command + ' ' + state + ' in' + this.state.frameCount)
    }
  }

  componentDidMount() {
    console.log('try peerConnection')
    console.log(this.props.room.player_count)
    window.receivedLog = this.receivedLog
    for (var i = 0; i < this.props.room.player_count; i++) {
      this.receivedLog[i] = new Array(this.delay)
      for (var j = 0; j < this.delay; j++) {
        this.receivedLog[i][j] = new Array(0)
      }
    }

    var pc = new peerConnection(this.props.id_in_room, data => {
      console.log(data)
      if (data.type == 'operation') {
        this.receivedLog[data.id][data.frameCount - this.state.frameCount] = data.operation
      }
    })
    window.pc = pc
    var count = 0
    var int = setInterval(
      () => {
        var state = pc.getState()
        if (count < 10 && state == peerConnection.CONNECTING) {
          count++
          return
        }
        if (state == peerConnection.CONNECTED) {
          alert("CONNECTED, using peerConnection")
          this.send = function (data) {
            pc.dataChannel.send(JSON.stringify(data))
          }
          this.start()
          clearInterval(int)
        } else {
          alert("FAILED, using websocket")
          ws.addOnmessage('operation', data => {
            this.receivedLog[data.id][data.frameCount - this.state.frameCount] = data.operation
          })
          this.send = ws.send
          this.start()
          clearInterval(int)
        }
      },
      500
    )
  }

  start() {
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        for (var i = 0; i < this.props.room.player_count; i++) {
          if (typeof this.receivedLog[i][0] === 'undefined') {
            console.log('waiting for user ' + i + '\'s command in frame ' + this.state.frameCount)
            return
          }
        }

        this.receivedLog[this.props.id_in_room][this.delay] = this.localLog
        for (var i = 0; i < this.props.room.player_count; i++) {
          for (var j = 0; j < this.receivedLog[i][0].length; j++) {
            this.action(this.receivedLog[i][0][j])
          }
          this.receivedLog[i].shift()
        }

        this.props.nes.frame()
        this.send({
          type: 'operation',
          id: this.props.id_in_room,
          frameCount: this.state.frameCount + this.delay,
          operation: this.localLog,
        })
        this.localLog = []
        this.setState({ frameCount: this.state.frameCount + 1 })
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

export default Emulator;