import React from 'react'
import { connect } from 'react-redux'

import './Menu.scss'
import ws from '../../../utils/websocket'
import {roomSet, gameTabSet, tabSet} from '../../../actions/actions'
import nesAPI from '../GameAPI.js'
import KeyboardSetting from './KeyboardSetting.jsx'

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isRunning: window.nes.isRunning,
      emulateSound: window.nes.opts.emulateSound,
      page: "游戏菜单",
    }
  }
  render() {
    var list=[];
    var button="";
    for (var index in this.props.room.players) {
      if (this.props.room.players[index] != null) {
        list.push(
          <tbody key={index}><tr>
            <td style={{textAlign: "center"}}><img className='gameTabAvatar' src={this.props.room.players[index].avatar}/></td>
            <td><span>{this.props.room.players[index].name}</span></td>
            <td><span>玩家{parseInt(index)+1}</span></td>
          </tr></tbody>
        )
      }
    }
    return (
      <div className='GameTab'>
        {this.state.page=="键位设置"?
          <KeyboardSetting/>:
        (this.state.page=="游戏菜单"?
          <div className='menuWindow'>
            <div style={{textAlign: "center"}}>游戏菜单</div>
            <div className='menuButtons'>
              <button onClick={() => {window.nes.ui.stopOrStart(), this.setState({isRunning: !this.state.isRunning})}}>{this.state.isRunning?'暂停游戏':'继续游戏'}</button>
              <button onClick={() => {window.nes.restart(), this.setState({isRunning: true})}} disabled>重新开始</button>
              <button onClick={() => this.props.gameTabSet("")} disabled>保存游戏</button>
              <button onClick={() => this.props.gameTabSet("")} disabled>装载游戏</button>
              <button onClick={() => {window.nes.ui.emulateSoundChange(), this.setState({emulateSound: !this.state.emulateSound})}}>{this.state.emulateSound?'关闭声音':'打开声音'}</button>
              <button onClick={() => this.setState({page: "键位设置"})} disabled>键位设置</button>
              <button onClick={() => this.props.tabSet("Room", true)}>结束游戏</button>
              <br />
              <button onClick={() => {document.getElementById('window').focus();this.props.gameTabSet("")}}>回到游戏</button>
            </div>
          </div>:
        <div />)
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      game: state.game,
      room: state.room,
    }
}

export default connect(mapStateToProps, {roomSet, gameTabSet, tabSet})(Menu);