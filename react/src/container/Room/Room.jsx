import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import userApi from '../../api/user.js'
import ws from '../../websocket/index.js'
import Scroll from '../../components/Scroll.jsx'

class Room extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      msg: [],
    }
  }

  componentDidMount() {
    ws.addOnmessage('roomMsg', data => {
      console.log(this.state.msg);
      var msg = {
        from: data.from,
        msg: data.msg,
      }
      this.state.msg.push(msg);
      this.setState({ msg: this.state.msg });
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

  render() {
    return (
      <div className='Room'>
        <div className='game-info'>
          <div className='id'>房间号：{this.props.params.roomID}</div>
          <img src={'/roms/' + this.props.params.gameName + '.jpg'} /><br />
          {/* <span>房间 </span><input type='text' className='name' defaultValue={this.props.room.name}/><br/> */}
          <span>游戏 </span><input type='text' className='name' defaultValue={this.props.params.gameName} disabled /><br />
          {/* <span>密码 </span><input type='text' className='name' defaultValue={this.props.room.password}/> */}
          <button>保存设置</button>
        </div>
        <div className='users'>
          <table>
            <thead><tr>
              <td width='60%'>玩家</td>
              <td width='40%'>状态</td>
            </tr></thead>
            {/* {list} */}
          </table>
        </div>
        <div className='controls'>
          {/* <button onClick={this.leave.bind(this)}>退出</button> */}
          <button>邀请好友</button>
          {/* {button=="开始"?<button style={{background: 'red'}} onClick={this.start.bind(this)}>开始</button>:
          (button=="等待准备"?<button style={{background: 'gray'}} disabled>等待准备</button>:
          (button=="取消准备"?<button style={{background: 'orange'}} onClick={this.unready.bind(this)}>取消准备</button>:
          <button style={{background: 'blue'}} onClick={this.ready.bind(this)}>准备</button>))
          } */}
        </div>
        <div id='chatHistoryBox' className='chatHistoryBox'>
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
        </div>
        <div className='chat'>
          <input type='text' id='send' onKeyUp={this.enter.bind(this)} />
          <button onClick={this.send.bind(this)}>发送</button>
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