import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import ws from '../../../utils/websocket/index.js'
import constant from '../../../utils/constant.js'
import gameApi from '../../../utils/api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../utils/actions/index.js'
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
      frameID: 0,
      emulateSound: this.props.nes.opts.emulateSound,
      playMode: constant.PLAY_MODE_ONLINE,
      msg: [],
    }
  }

  addMsg(from, msg) {
    var msg = {
      from: from,
      msg: msg,
    }
    this.state.msg.push(msg)
    setTimeout(() => {
      this.state.msg.shift();
      this.setState({ msg: this.state.msg });
    },
      1000 * 15
    );
    this.setState({ msg: this.state.msg })
  }

  componentWillMount() {
    this.updatePlayMode()
  }

  componentDidMount() {
    ws.addOnmessage('roomMsg', data =>
      this.addMsg(data.from, data.msg)
    )
    this.restart()
  }

  updatePlayMode() {
    if (this.state.playMode == constant.PLAY_MODE_LOCAL) {
      return
    }
    if (this.props.room.player_count > 1) {
      var inGameCount = 0
      for (var i = 0; i < this.props.room.players.length; i++) {
        var player = this.props.room.players[i]
        if (player != null && player.state_in_room == constant.ROOM_PLAYER_STATE_IN_GAME) {
          inGameCount++
        }
      }
      if (inGameCount > 1) {
        return
      }
    }
    this.setState({ playMode: constant.PLAY_MODE_LOCAL })
  }

  componentDidUpdate(prevProps, prevState) {
    this.updatePlayMode()
  }

  componentWillUnmount() {
    ws.removeOnmessage("roomMsg")
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

  addFrameID() {
    this.setState({frameID: this.state.frameID+1})
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
          <button onClick={() => { this.setState({ tab: this.KeyboardSetting }) }}>按键设置</button>
          <button onClick={() => { this.setState({ tab: this.Menu }); }}>菜单</button>
          <Timer 
            frameID={this.state.frameID}
          />
          <button onClick={() => { this.setState({ tab: this.Players }) }}>玩家</button>
          <input type='text' value={this.props.room.game} className="Timer" disabled />
        </div>
        <div className='window' ref='window' id='window' tabIndex="0">
          <Emulator
            room={this.props.room}
            id_in_room={this.props.id_in_room}
            emulateSound={this.state.emulateSound}
            keyboard={this.props.keyboard}
            isRunning={this.state.isRunning}
            playMode={this.state.playMode}
            nes={this.props.nes}
            addMsg={this.addMsg.bind(this)}
            frameID={this.state.frameID}
            addFrameID={this.addFrameID.bind(this)}
          />
          <Chat
            msg={this.state.msg}
          />
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