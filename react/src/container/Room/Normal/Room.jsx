import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import userApi from '../../../api/user.js'
import gameApi from '../../../api/game.js'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'

class Room extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      msg: [],
    }
  }

  componentWillMount() {
    ws.addOnmessage('roomMsg', data => {
      var msg = {
        from: data.from,
        msg: data.msg,
      }
      this.state.msg.push(msg)
      this.setState({ msg: this.state.msg })
    })
  }

  componentWillUnmount() {
    ws.removeOnmessage("roomMsg")
  }

  send() {
    var msg = this.refs.send.value;
    if (msg != '') {
      ws.send({
        "type": "roomMsg",
        "msg": msg
      })
      this.refs.send.value = '';
    } else {
      alert("发送消息不能为空");
    }
  }

  leaveRoom() {
    ws.send({ type: 'leaveRoom' })
    history.go(-1)
  }
  ready() {
    ws.send({ "type": "ready" });
  }
  unready() {
    ws.send({ "type": "unready" });
  }
  start() {
    ws.send({ "type": "start" });
  }

  render() {
    var userlist = []
    var button = this.props.loadingState == constant.LOADINGROOM ? '正在加载房间信息' : '正在下载地图...'
    if (this.props.loadingState == constant.LOADED) {
      if (this.props.room.state == constant.ROOM_STATE_IN_GAME) {
        location.href = '#/room/' + this.props.room.id + '/play'
        return
      }
      var existUnready = false
      for (var i = 0; i < this.props.room.players.length; i++) {
        if (this.props.room.players[i]!=null) {
          var playerName = this.props.room.players[i].name
          var playerAvatar = this.props.room.players[i].avatar
          var playerState = this.props.room.players[i].state_in_room
          var host_id = this.props.room.host_id
          if (playerState == constant.ROOM_PLAYER_STATE_UNREADY && host_id != i) {
            existUnready = true
          }
          userlist.push(
            <tbody key={i}><tr className={i & 1 ? 'even' : 'odd'}>
              <td><img src={playerAvatar} /><span>{playerName}</span></td>
              <td>{i == host_id ?
                <div style={{ color: 'red' }}>房主</div> :
                <div style={{ color: 'green' }}>{constant.ROOM_PLAYER_STATE_TEXT[playerState]}</div>
              }</td>
            </tr></tbody>
          )
        } else {
          userlist.push(
            <tbody key={i}><tr className={i & 1 ? 'even' : 'odd'}>
              <td><img src={constant.ROOM_AVATAR_TOPN} /><span></span></td>
              <td></td>
            </tr></tbody>
          )
        }
      }
      var id = this.props.id_in_room
      if (id == this.props.room.host_id) {
        if (existUnready) {
          button = "等待准备"
        } else {
          button = "开始"
        }
      } else {
        switch (this.props.room.players[id].state_in_room) {
          case constant.ROOM_PLAYER_STATE_UNREADY:
            button = "准备"
            break;
          case constant.ROOM_PLAYER_STATE_READY:
            button = "取消准备"
            break;
          default:
            button = "未知错误"
            break;
        }
      }
    }

    return (
      <div className='Room-Normal'>
        <div className='game-info'>
          <div className='id'>房间号：{this.props.room.id}</div>
          <img src={typeof (this.props.room.game) == 'undefined' ? '/roms/loading.gif' : '/roms/' + this.props.room.game + '.jpg'} /><br />
          {/* <span>房间 </span><input type='text' className='name' defaultValue={this.props.room.name}/><br/> */}
          <span>游戏 </span><input type='text' className='name' value={this.props.room.game} disabled /><br />
          {/* <span>密码 </span><input type='text' className='name' defaultValue={this.props.room.password}/> */}
          <button>保存设置</button>
        </div>
        <div className='users'>
          <table>
            <thead><tr>
              <td width='60%'>玩家</td>
              <td width='40%'>状态</td>
            </tr></thead>
            {userlist}
          </table>
        </div>
        <div className='controls'>
          <button onClick={() => this.leaveRoom()}>退出</button>
          {/* <button>邀请好友</button> */}
          {button == "开始" ? <button style={{ background: 'red' }} onClick={this.start.bind(this)}>{button}</button> :
            (button == "等待准备" ? <button style={{ background: 'gray' }} disabled>{button}</button> :
              (button == "取消准备" ? <button style={{ background: 'orange' }} onClick={this.unready.bind(this)}>{button}</button> :
                (button == "准备" ? <button style={{ background: 'blue' }} onClick={this.ready.bind(this)}>{button}</button> :
                  <button style={{ background: 'gray' }} disabled>{button}</button>)))
          }
        </div>
        <div id='chatHistory' className='chatHistory'>
          {this.state.msg.map((msg, index) => {
            return (
              <div className='list' key={index}>
                <span style={{ color: 'green' }}>[{msg.from}]: </span>
                <span style={{ color: 'white' }}>{msg.msg}</span>
              </div>
            )
          })}
        </div>
        <div className='chat'>
          <input type='text' ref='send' onKeyUp={e => { if (e.keyCode == 13) this.send() }} autoFocus />
          <button onClick={this.send.bind(this)}>发送</button>
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

export default connect(mapStateToProps, null)(Room);