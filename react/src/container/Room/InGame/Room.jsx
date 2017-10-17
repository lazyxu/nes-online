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
import KeyboardSetting from './KeyboardSetting.jsx'
// import audio from '../nes/audio.js'
// import nes from '../nes/nes.js'

class Room extends React.Component {

  constructor(props) {
    super(props);
    this.Menu = "Menu"
    this.Players = "Players"
    this.KeyboardSetting = "KeyboardSetting"
    this.state = {
      tab: "",
      isRunning: true,
      emulateSound: true,
      playMode: constant.LOCAL,
    }
  }

  componentWillMount() {
    this.setState({ emulateSound: this.props.nes.opts.emulateSound })
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  closeTab() {
    this.refs.window.focus();
    this.setState({ tab: "" })
  }

  updateIsRunning(isRunning) {
    this.setState({ isRunning: isRunning })
  }

  updateEmulateSound(emulateSound) {
    this.props.nes.emulateSound = emulateSound
    this.setState({ emulateSound: emulateSound })
  }

  restart() {
    this.updateIsRunning(true)
    this.props.nes.reloadROM()
  }

  render() {
    return (
      <div className='Room-InGame'>
        {this.state.tab == this.Players ? <Players closeTab={this.closeTab.bind(this)} room={this.props.room} /> :
          this.state.tab == this.Menu ?
            <Menu
              closeTab={this.closeTab.bind(this)}
              room={this.props.room}
              isRunning={this.state.isRunning}
              updateIsRunning={this.updateIsRunning.bind(this)}
              restart={this.restart.bind(this)}
              emulateSound={this.state.emulateSound}
              updateEmulateSound={this.updateEmulateSound.bind(this)}
              nes={this.props.nes}
            /> :
            this.state.tab == this.KeyboardSetting ?
              <KeyboardSetting
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
          <button onClick={() => { this.setState({ tab: this.KeyboardSetting }) }}>按键设置</button>
        </div>
        <div className='window' ref='window' id='window' tabIndex="0">
          <Emulator
            emulateSound={this.state.emulateSound}
            keyboard={this.props.keyboard}
            isRunning={this.state.isRunning}
            nes={this.props.nes}
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