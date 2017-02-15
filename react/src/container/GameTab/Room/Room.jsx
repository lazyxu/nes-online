import React from 'react'

import './main.scss'
import ws from '../../../utils/websocket'

export default class Room extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nes: null,
      msg: [],
      msgCount: 0
    }
  }

  componentDidMount() {
    ws.on('roomMsg', (data) => {
      console.log(this.state.msg);
      var msg = {
        from: data.from,
        msg: data.msg
      }
      this.state.msg.push(msg);
      this.setState({msgCount: this.state.msgCount+1});
      new addScroll('chat-history-box','chat-history','scrollDiv');
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
      alert("d");
    }
  }

  render() {
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
            <tbody><tr className='odd'>
              <td><img src={this.props.room.players[0].avatar}/><span>{this.props.room.players[0].name}</span></td>
              <td>{this.props.room.players[0].state}</td>
            </tr></tbody>
              {this.props.room.players[1] != null ?
                <tbody><tr className='even'>
                  <td><img src={this.props.room.players[1].avatar}/><span>{this.props.room.players[1].name}</span></td>
                  <td>{this.props.room.players[0].state}</td>
                </tr></tbody>
                  :
                <tbody><tr className='even'>
                  <td><img src='/img/open.png'/></td>
                  <td></td>
                </tr></tbody>
              }
          </table>
        </div>
        <div className='controls'>
          <button>退出</button>
          <button>邀请好友</button>
          <button>开始</button>
        </div>
        <div id='chat-history-box' className='chat-history-box'>
          <div id='chat-history' className='chat-history'>
            {this.state.msg.map((msg, index)=>{
              return (
                <div className='list' key={index}>
                  <span style={{color: 'green'}}>[{msg.from}]: </span>
                  <span style={{color: 'white'}}>{msg.msg}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className='chat-edit'>
          <input type='text' id='send' onKeyUp={this.enter.bind(this)}/>
          <button onClick={this.send.bind(this)}>发送</button>
        </div>
      </div>
    );
  }
}