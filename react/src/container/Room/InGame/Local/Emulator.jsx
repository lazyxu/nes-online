import React from 'react'
import { connect } from 'react-redux'

import ws from '../../../../websocket/index.js'
import Controller from './Controller.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props);
    this.frameInterval = null
  }

  componentDidMount() {
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        this.props.nes.frame()
      }
    }, 1000 / 60)
  }
  
  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  render() {
    return (
      <Controller
        keyboard={this.props.keyboard}
        nes={this.props.nes}
      />
    )
  }
}

export default Emulator;