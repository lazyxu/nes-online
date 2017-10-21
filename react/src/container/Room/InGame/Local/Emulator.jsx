import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../utils/constant.js'
import ws from '../../../../utils/websocket/index.js'
import Controller from './Controller.jsx'
import Screen from './Screen.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props);
    this.frameInterval = null
  }

  componentDidMount() {
    this.props.addMsg(constant.MSG_FROM_SYSTEM, '自动调整为单机模式')
    this.frameInterval = setInterval(() => {
      if (this.props.isRunning) {
        this.props.nes.frame()
        this.props.addFrameID()
      }
    }, 1000 / 60)
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  setOnFrame(func) {
    this.props.nes.opts.onFrame = func
  }

  render() {
    return (
      <div>
        <Controller
          keyboard={this.props.keyboard}
          nes={this.props.nes}
        />
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
        />
      </div>
    )
  }
}

export default Emulator;