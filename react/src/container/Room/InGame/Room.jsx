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
// import keyboard from '../../api/user/keyboard.js'
class Room extends React.Component {

  constructor(props) {
    super(props);
    this.Menu = "Menu"
    this.Players = "Players"
    this.state = {
      keyboard: constant.DEFAULT_KEYBOARD,
      tab: "",
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  closeTab() {
    this.refs.window.focus();
    this.setState({ tab: "" })
  }

  render() {
    return (
      <div className='Room-InGame'>
        {this.state.tab == this.Players ? <Players closeTab={this.closeTab.bind(this)} room={this.props.room} /> :
          this.state.tab == this.Menu ? <Menu closeTab={this.closeTab.bind(this)} room={this.props.room} /> :
            <div />
        }
        <div className='buttons'>
          <button disabled>任务</button>
          <button onClick={() => { this.setState({ tab: this.Menu }); }}>菜单</button>
          <Timer />
          <button onClick={() => { this.setState({ tab: this.Players }) }}>玩家</button>
          <button disabled>聊天</button>
        </div>
        <div className='window' ref='window' id='window' tabIndex="0">
          <Emulator keyboard={this.state.keyboard} />
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