import React from 'react'
import { connect } from 'react-redux'

import './Emulator.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'
import Screen from './Common/Screen.jsx'
import Audio from './Common/Audio.jsx'
import LocalEmulator from './Local/Emulator.jsx'
import WebSocketEmulator from './WebSocket/Emulator.jsx'
import PeerConnectionEmulator from './PeerConnection/Emulator.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
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
        {
          this.props.playMode == constant.PLAY_MODE_LOCAL ?
            <LocalEmulator
              keyboard={this.props.keyboard}
              isRunning={this.props.isRunning}
              nes={this.props.nes}
            /> :
            this.props.playMode == constant.PLAY_MODE_WEBSOCKET ?
              <WebSocketEmulator
                id_in_room={this.props.id_in_room}
                room={this.props.room}
                keyboard={this.props.keyboard}
                isRunning={this.props.isRunning}
                nes={this.props.nes}
              /> :
              this.props.playMode == constant.PLAY_MODE_PEER_CONNECTION ?
                <PeerConnectionEmulator
                  id_in_room={this.props.id_in_room}
                  room={this.props.room}
                  keyboard={this.props.keyboard}
                  isRunning={this.props.isRunning}
                  nes={this.props.nes}
                /> :
                <div />
        }
      </div>
    )
  }
}

export default Emulator;