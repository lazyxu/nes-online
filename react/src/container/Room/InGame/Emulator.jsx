import React from 'react'
import { connect } from 'react-redux'

import './Emulator.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'
// import Players from './Players.jsx'
// import Chat from './Chat.jsx'
import Keyboard from './Local/Keyboard.jsx'
import Screen from './Common/Screen.jsx'
import Audio from './Common/Audio.jsx'
// import keyboard from '../../api/user/keyboard.js'
// import nes from '../nes/nes.js'
class Emulator extends React.Component {

  constructor(props) {
    super(props);
    this.interval = null
  }

  start() {
    this.interval = setInterval(() => {
      this.props.nes.frame()
    }, 1000 / 60)
  }

  stop() {
    clearInterval(this.interval)
  }

  componentDidMount() {
    this.props.nes.reloadROM()
    this.start()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isRunning != this.props.isRunning) {
      if (this.props.isRunning) {
        this.interval = setInterval(() => {
          this.props.nes.frame()
        }, 1000 / 60)
      } else {
        this.stop()
      }
    }
  }

  componentWillUnmount() {
    this.stop()
  }

  setOnFrame(func) {
    this.props.nes.opts.onFrame = func
  }

  setOnAudioSample(func) {
    this.props.nes.opts.onAudioSample = func
  }

  render() {
    return (
      <div ref='emulator' className='Emulator'>
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
        />
        <Audio
          emulateSound={this.props.emulateSound}
          setOnAudioSample={this.setOnAudioSample.bind(this)}
        />
        <Keyboard
          keyboard={this.props.keyboard}
          nes={this.props.nes}
        />
      </div>
    )
  }
}

export default Emulator;