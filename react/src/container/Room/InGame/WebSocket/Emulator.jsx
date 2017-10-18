import React from 'react'
import { connect } from 'react-redux'

import ws from '../../../../websocket/index.js'
import Controller from '../Common/Controller.jsx'
import operation from '../Common/operation.js'

class Emulator extends React.Component {

  constructor(props) {
    super(props)
    this.frameInterval = null
    this.state = {
      frameCount: 0,
    }
    this.delay = 5
    this.localLog = -1
  }

  setOperation(command, state) {
    console.log('setOperation')
    console.log(this.state.frameCount + this.delay)
    console.log(command)
    console.log(state)
    this.localLog = operation.encode(
      this.state.frameCount + this.delay,
      this.props.id_in_room,
      command,
      state
    )
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
    console.log('try websocket')
    console.log(this.props.room.player_count)
    var receivedLog = new Array(this.props.room.player_count)
    window.receivedLog = receivedLog
    for (var i = 0; i < this.props.room.player_count; i++) {
      receivedLog[i] = new Array(this.delay)
      for(var j=0;j<this.delay;j++) {
        receivedLog[i][j] = -1
      }
    }

    ws.addOnmessage('operation', data => {
      if (data.operation!=-1) {
        var op = data.operation
        var frameCount = operation.frameCount(op)
        var id = operation.id(op)
        var command = operation.command(op)
        var state = operation.state(op)
        console.log('Onmessage')
        console.log(frameCount)
        console.log(id)
        console.log(command)
        console.log(state)
      }
      receivedLog[data.id][data.frameCount-this.state.frameCount] = data.operation
    })

    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        for (var i = 0; i < this.props.room.player_count; i++) {
          if (typeof receivedLog[i][0] === 'undefined') {
            console.log('waiting for user ' + i + '\'s command in frame ' + this.state.frameCount)
            return
          }
        }

        for (var i = 0; i < this.props.room.player_count; i++) {
          this.action(receivedLog[i][0])
          receivedLog[i].shift()
        }

        this.props.nes.frame()
        ws.send({
          type: 'operation',
          id: this.props.id_in_room,
          frameCount: this.state.frameCount + this.delay,
          operation: this.localLog,
        })
        this.localLog = -1
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
        setOperation={this.setOperation.bind(this)}
      />
    )
  }
}

export default Emulator;