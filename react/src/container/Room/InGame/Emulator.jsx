import React from 'react'
import { connect } from 'react-redux'

import './Emulator.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'
import Audio from './Common/Audio.jsx'
import LocalEmulator from './Local/Emulator.jsx'
import OnLineEmulator from './OnLine/Emulator.jsx'

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

  setOnAudioSample(func) {
    this.props.nes.opts.onAudioSample = func
  }

  render() {
    return (
      <div ref='emulator' className='Emulator'>
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
              addMsg={this.props.addMsg}
            /> :
            this.props.playMode == constant.PLAY_MODE_ONLINE ?
              <OnLineEmulator
                id_in_room={this.props.id_in_room}
                room={this.props.room}
                keyboard={this.props.keyboard}
                isRunning={this.props.isRunning}
                nes={this.props.nes}
                addMsg={this.props.addMsg}
              /> :
              <div />
        }
      </div>
    )
  }
}

export default Emulator;