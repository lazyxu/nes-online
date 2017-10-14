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
// import Chat from './Chat.jsx'
// import Menu from './Menu.jsx'
// import keyboard from '../../api/user/keyboard.js'
class Room extends React.Component {

  constructor(props) {
    super(props);
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
    this.setState({tab: ""})
  }

  render() {
    return (
      <div className='Room-InGame'>
        {this.state.tab=="Players"?<Players closeTab={this.closeTab.bind(this)}  room={this.props.room}/>:
          <div/>
        }
        <div className='buttons'>
        <button disabled>任务</button>
          <button onClick={() => { this.setState({ chatHide: true }); this.props.gameTabSet("Menu"); }}>菜单</button>
          <Timer />
          <button onClick={() => { this.setState({tab: "Players"}) }}>玩家</button>
          <button disabled>聊天</button>
        </div>
        <div className='window' id='window' tabIndex="0">
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