import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import userApi from '../../api/user.js'
import ws from '../../websocket/index.js'
import Scroll from '../../components/Scroll.jsx'

class Room extends React.Component {

  constructor(props) {
    super(props);
    // this.props.router.setRouteLeaveHook(
    //   this.props.route,
    //   nextLocation => {
    //     alert('确认要离开房间?')
    //   }
    // )
    this.state = {
      msg: [],
      room: {},
    }
  }

  componentDidMount() {
    ws.addOnmessage('roomMsg', data => {
      if (data.hasOwnProperty('msg')) {
        var msg = {
          from: data.from,
          msg: data.msg,
        }
        this.state.msg.push(msg)
        this.setState({ msg: this.state.msg })
      }
      if (data.hasOwnProperty('room') && data.room != null) {
        this.setState({ room: data.room })
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
    var button = ''
    if (this.state.room.players != null) {
      this.state.room.players.forEach((player, index) => {
        if (player != null && player.name == this.props.user.name) {
          switch (player.state) {
            case "房主":
              if (this.state.room.state == "等待开始")
                button = "开始"
              else if (this.state.room.state == "等待准备")
                button = "等待准备"
              break;
            case "已准备":
              button = "取消准备"
              break;
            case "未准备":
              button = "准备"
              break;
            default:
              break;
          }
        }
        userlist.push(
          player != null ?
            <tbody key={index}><tr className={index & 1 ? 'even' : 'odd'}>
              <td><img src={player.avatar} /><span>{player.name}</span></td>
              <td>{player.state == "房主" ?
                <div style={{ color: 'red' }}>{player.state}</div> :
                <div style={{ color: 'green' }}>{player.state}</div>
              }</td>
            </tr></tbody>
            :
            <tbody key={index}><tr className={index & 1 ? 'even' : 'odd'}>
              <td><img src='/img/open.png' /></td>
              <td></td>
            </tr></tbody>
        )
      })
    }
    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a> | <a href="#/roomList/">房间列表</a>
        </div>
        <div className='Room'>
          <div className='game-info'>
            <div className='id'>房间号：{this.props.params.roomID}</div>
            <img src={'/roms/' + this.state.room.game + '.jpg'} /><br />
            {/* <span>房间 </span><input type='text' className='name' defaultValue={this.props.room.name}/><br/> */}
            <span>游戏 </span><input type='text' className='name' defaultValue={this.state.room.game} disabled /><br />
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
            {button == "开始" ? <button style={{ background: 'red' }} onClick={this.start.bind(this)}>开始</button> :
              (button == "等待准备" ? <button style={{ background: 'gray' }} disabled>等待准备</button> :
                (button == "取消准备" ? <button style={{ background: 'orange' }} onClick={this.unready.bind(this)}>取消准备</button> :
                  <button style={{ background: 'blue' }} onClick={this.ready.bind(this)}>准备</button>))
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