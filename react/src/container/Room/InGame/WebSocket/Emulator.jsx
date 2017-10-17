import React from 'react'
import { connect } from 'react-redux'

import ws from '../../../../websocket/index.js'
import Controller from './Controller.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props)
    this.frameInterval = null
    this.player_count = this.props.room.player_count
    this.state = {
      frameCount: 0,
    }
  }

  setOperation(command, state) {
    
    return operation.encode(this.props.frameCount, this.props.id_in_room, command, state)
  }

  componentDidMount() {
    var operationLog = new Array(this.player_count)
    for (var i = 0; i < this.player_count; i++) {
      operationLog[i] = new Array(this.player_count)
    }

    var delay = 5
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        if (this.state.frameCount >= delay) { // 0, 1, 2, 3, 4
          for (var i = 0; i < this.player_count; i++) {
            var log = operationLog[i % delay]
            if (log !=-1) {
            }
          }
        }
        this.props.nes.frame()
        this.setState({ frameCount: this.state.frameCount + 1 })
      }
    }, 1000 / 60)
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  render() {
    return (
      <Controller
        id_in_room={this.state.id_in_room}
        controller={this.props.controller}
        nes={this.props.nes}
        setOperation={this.state.setOperation}
      />
    )
  }
}

export default Emulator;