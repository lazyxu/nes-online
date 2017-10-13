import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import userApi from '../../api/user.js'
import gameApi from '../../api/game.js'
import ws from '../../websocket/index.js'
import constant from '../../constant.js'

class Room extends React.Component {

  constructor(props) {
    super(props);
    // this.props.router.setRouteLeaveHook(
    //   this.props.route,
    //   nextLocation => {
    //     alert('确认要离开房间?')
    //   }
    // )
    this.LOADINGROOM = 0
    this.LOADINGMAP = 1
    this.LOADED = 2
    this.state = {
      msg: [],
      room: {},
      idInRoom: -1,
      loadingState: this.LOADINGROOM,
    }
  }

  componentWillMount() {
    ws.addOnmessage('roomMsg', data => {
      if (data.hasOwnProperty('msg')) {
        var msg = {
          from: data.from,
          msg: data.msg,
        }
        this.state.msg.push(msg)
        this.setState({ msg: this.state.msg })
      }
      if (data.hasOwnProperty('room')) {
        if (this.state.loadingState == this.LOADINGROOM) {
          this.setState({ loadingState: this.LOADINGMAP })
          gameApi.getRom(data.room.game).then(resp => {
            this.setState({ loadingState: this.LOADED })
            window.nes.loadROM(resp)
          })
        }
        this.setState({ room: data.room })
      }
      if (data.hasOwnProperty('idInRoom')) {
        this.setState({idInRoom: data.idInRoom })
      }
      if (data.hasOwnProperty('errMsg')) {
        alert(data.errMsg)
        history.go(-1)
      }
    })
    ws.send({
      type: 'enterRoom',
      "roomID": this.props.params.roomID
    })
  }

  componentWillUnmount() {
    ws.removeOnmessage("roomMsg")
  }

  enter(e) {
    if (e.keyCode == 13)
      this.send();
  }

  send() {
    var input = document.getElementById('send');
    var msg = input.value;
    if (msg != '') {
      ws.send({
        "type": "roomMsg",
        "msg": msg
      })
      input.value = '';
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
    var button = this.state.loadingState == this.LOADINGROOM ? '正在加载房间信息' : '正在下载地图...'
    if (this.state.loadingState == this.LOADED) {
      if (this.state.room.state==constant.ROOM_STATE_IN_GAME) {
        location.href = '#/room/' + this.state.room.id + '/play'
        return
      }
      var existUnready = false
      for (var i = 0; i < this.state.room.playerNames.length; i++) {
        var playerName = this.state.room.playerNames[i]
        var playerAvatar = this.state.room.playerAvatars[i]
        var playerState = this.state.room.playerStates[i]
        var hostID = this.state.room.hostID
        if (playerState == constant.ROOM_PLAYER_STATE_UNREADY && hostID != i) {
          existUnready = true
        }
        userlist.push(
          <tbody key={i}><tr className={i & 1 ? 'even' : 'odd'}>
            <td><img src={playerAvatar} /><span>{playerName}</span></td>
            <td>{i == hostID ?
              <div style={{ color: 'red' }}>房主</div> :
              <div style={{ color: 'green' }}>{constant.ROOM_PLAYER_STATE_TEXT[playerState]}</div>
            }</td>
          </tr></tbody>
        )
      }
      var id = this.state.idInRoom
      if (id == this.state.room.hostID) {
        if (existUnready) {
          button = "等待准备"
        } else {
          button = "开始"
        }
      } else {
        switch (this.state.room.playerStates[id]) {
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
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a> | <a href="#/roomList/">房间列表</a>
        </div>
        <div className='Room'>
          <div className='game-info'>
            <div className='id'>房间号：{this.props.params.roomID}</div>
            <img src={typeof (this.state.room.game) == 'undefined' ? '/roms/loading.gif' : '/roms/' + this.state.room.game + '.jpg'} /><br />
            {/* <span>房间 </span><input type='text' className='name' defaultValue={this.props.room.name}/><br/> */}
            <span>游戏 </span><input type='text' className='name' value={this.state.room.game} disabled /><br />
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
            <input type='text' id='send' onKeyUp={this.enter.bind(this)} autoFocus />
            <button onClick={this.send.bind(this)}>发送</button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    room: state.room,
    user: state.user,
  }
}

export default connect(mapStateToProps, null)(Room);