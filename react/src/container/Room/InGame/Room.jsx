import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'
import Emulator from './Emulator.jsx'
import Timer from './Timer.jsx'
import Chat from './Chat.jsx'
import Players from './Players.jsx'
import Menu from './Menu.jsx'
import Keyboard from './Keyboard.jsx'

class Room extends React.Component {

  constructor(props) {
    super(props);
    this.Menu = "Menu"
    this.Players = "Players"
    this.Keyboard = "Keyboard"
    this.state = {
      tab: "",
      isRunning: true,
      emulateSound: true,
    }
  }

  audioInit() {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    // 立体声
    var channels = 2;
    var sampleRate = window.nes.papu.sampleRate

    // 创建一个 采样率与音频环境(AudioContext)相同的 的 音频片段。
    var frameCount = 8192;

    var audioBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate);
    var myFrameCount = 0
    window.nes.opts.onAudioSample = (left, right) => {
      if (myFrameCount == frameCount) {
        myFrameCount = 0
        var source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start()
      }
      audioBuffer.getChannelData(0)[myFrameCount] = left
      audioBuffer.getChannelData(1)[myFrameCount] = right
      myFrameCount++
    }
  }

  componentWillMount() {
    this.audioInit()
  }

  componentDidMount() {
    this.setState({ emulateSound: window.nes.opts.emulateSound })
  }

  componentWillUnmount() {
  }

  closeTab() {
    this.refs.window.focus();
    this.setState({ tab: "" })
  }

  updateIsRunning(isRunning) {
    if (isRunning) {
      window.nes.start()
    } else {
      window.nes.stop()
    }
    this.setState({ isRunning: isRunning })
  }

  updateEmulateSound(emulateSound) {
    window.nes.opts.emulateSound = emulateSound
    this.setState({ emulateSound: emulateSound })
  }

  restart() {
    window.nes.reloadROM()
  }

  render() {
    return (
      <div className='Room-InGame'>
        {this.state.tab == this.Players ? <Players closeTab={this.closeTab.bind(this)} room={this.props.room} /> :
          this.state.tab == this.Menu ?
            <Menu
              closeTab={this.closeTab.bind(this)}
              room={this.props.room}
              restart={this.restart.bind(this)}
              isRunning={this.state.isRunning}
              updateIsRunning={this.updateIsRunning.bind(this)}
              emulateSound={this.state.emulateSound}
              updateEmulateSound={this.updateEmulateSound.bind(this)}
            /> :
            this.state.tab == this.Keyboard ?
              <Keyboard
                closeTab={this.closeTab.bind(this)}
                updateKeyboard={this.props.updateKeyboard}
                keyboard={this.props.keyboard}
              /> :
              <div />
        }
        <div className='buttons'>
          <button disabled>任务</button>
          <button onClick={() => { this.setState({ tab: this.Menu }); }}>菜单</button>
          <Timer />
          <button onClick={() => { this.setState({ tab: this.Players }) }}>玩家</button>
          <button onClick={() => { this.setState({ tab: this.Keyboard }) }}>按键设置</button>
        </div>
        <div className='window' ref='window' id='window' tabIndex="0">
          <Emulator
            keyboard={this.props.keyboard}
          />
          <Chat />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}

export default connect(mapStateToProps, { roomSet, gameTabSet, msgSet, msgAdd, keyboardGet })(Room);