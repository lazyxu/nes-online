import React from 'react'
import { connect } from 'react-redux'

import './Room.scss'
import ws from '../../utils/websocket'
import Scroll from '../../components/Scroll.jsx'

class Room extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      msg: [],
    }
  }

  componentDidMount() {
    ws.on('roomMsg', data => {
      console.log(this.state.msg);
      var msg = {
        from: data.from,
        msg: data.msg,
      }
      this.state.msg.push(msg);
      this.setState({msg: this.state.msg});
    });
  }

  enter(e) {
    if(e.keyCode == 13)
      this.send();
  }
  send() {
    var input = document.getElementById('send');
    var msg = input.value;
    if (msg!='') {
      ws.sendRoomMsg(msg);
      input.value = '';
    } else {
      alert("发送消息不能为空");
    }
  }

  leave() {
    ws.send({
      "type": "leaveRoom",
    });
  }
  ready() {
    ws.send({
      "type": "ready",
    });
  }
  unready() {
    ws.send({
      "type": "unready",
    });
  }
  start() {
    ws.send({
      "type": "start",
    });
  }

  render() {
    var list=[];
    var button="";
    for (var index in this.props.room.players) {
      if (this.props.room.players[index]!=null && this.props.room.players[index].name==this.props.user.name) {
        if (this.props.room.players[index].state=="房主") {
          if (this.props.room.state=="等待开始")
            button = "开始"
          else if  (this.props.room.state=="等待准备")
            button = "等待准备"
        } else if (this.props.room.players[index].state=="已准备") {
          button = "取消准备"
        } else {
          button = "准备"
        }
      }
      if (index & 1) {
        list.push(
          this.props.room.players[index] != null ?
            <tbody key={index}><tr className='odd'>
              <td><img src={this.props.room.players[index].avatar}/><span>{this.props.room.players[index].name}</span></td>
              <td>{this.props.room.players[index].state=="房主"?
                <div style={{color: 'red'}}>{this.props.room.players[index].state}</div>:
                <div style={{color: 'green'}}>{this.props.room.players[index].state}</div>
              }</td>
            </tr></tbody>
          :
            <tbody key={index}><tr className='odd'>
              <td><img src='/img/open.png'/></td>
              <td></td>
            </tr></tbody>
        )
      }
      else {
        list.push(
          this.props.room.players[index] != null ?
            <tbody key={index}><tr className='even'>
              <td><img src={this.props.room.players[index].avatar}/><span>{this.props.room.players[index].name}</span></td>
              <td>{this.props.room.players[index].state=="房主"?
                <div style={{color: 'red'}}>{this.props.room.players[index].state}</div>:
                <div style={{color: 'green'}}>{this.props.room.players[index].state}</div>
              }</td>
            </tr></tbody>
          :
            <tbody key={index}><tr className='even'>
              <td><img src='/img/open.png'/></td>
              <td></td>
            </tr></tbody>
        )
      }
    }
    return (
      <div className='Room'>
        <div className='game-info'>
          <div className='id'>房间号：{this.props.room.id}</div>
          <img src={'/rom/'+this.props.room.game+'.jpg'}/><br/>
          <span>房间 </span><input type='text' className='name' defaultValue={this.props.room.name}/><br/>
          <span>游戏 </span><input type='text' className='name' defaultValue={this.props.room.game} disabled/><br/>
          <span>密码 </span><input type='text' className='name' defaultValue={this.props.room.password}/>
          <button>保存设置</button>
        </div>
        <div className='users'>
          <table>
            <thead><tr>
              <td width='60%'>玩家</td>
              <td width='40%'>状态</td>
            </tr></thead>
            {list}
          </table>
        </div>
        <div className='controls'>
          <button onClick={this.leave.bind(this)}>退出</button>
          <button>邀请好友</button>
          {button=="开始"?<button style={{background: 'red'}} onClick={this.start.bind(this)}>开始</button>:
          (button=="等待准备"?<button style={{background: 'gray'}} disabled>等待准备</button>:
          (button=="取消准备"?<button style={{background: 'orange'}} onClick={this.unready.bind(this)}>取消准备</button>:
          <button style={{background: 'blue'}} onClick={this.ready.bind(this)}>准备</button>))
          }
        </div>
        <div id='chatHistoryBox' className='chatHistoryBox'>
          <div id='chatHistory' className='chatHistory'>
            {this.state.msg.map((msg, index)=>{
              return (
                <div className='list' key={index}>
                  <span style={{color: 'green'}}>[{msg.from}]: </span>
                  <span style={{color: 'white'}}>{msg.msg}</span>
                </div>
              )
            })}
          </div>
          <Scroll 
            mainBoxID='chatHistoryBox' 
            contentID='chatHistory'
            scrollUpdate={this.state.msg.length}
          />
        </div>
        <div className='chat'>
          <input type='text' id='send' onKeyUp={this.enter.bind(this)}/>
          <button onClick={this.send.bind(this)}>发送</button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
      game: state.game,
      room: state.room,
      user: state.user,
    }
}

export default connect(mapStateToProps, null)(Room);