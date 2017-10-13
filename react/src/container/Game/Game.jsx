import React from 'react'
import { connect } from 'react-redux'

import './Game.scss'
import ws from '../../websocket/index.js'
import gameApi from '../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../actions/actions'
// import Players from './Players.jsx'
// import Chat from './Chat.jsx'
// import Menu from './Menu.jsx'
// import keyboard from '../../api/user/keyboard.js'
class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      chatHide: true,
      msg: [],
      time: 0,
    }
  }

  msgAdd(msg) {
    this.state.msg.push(msg);
    this.props.msgAdd(msg);
    setTimeout(() => {
      this.state.msg.shift();
      this.setState({ msg: this.state.msg });
    },
      1000 * 15
    );
    this.setState({ msg: this.state.msg });
  }

  writeFrame(buffer) {
    var i = 0;
    for (var y = 0; y < 240; ++y) {
      for (var x = 0; x < 256; ++x) {
        i = y * 256 + x;
        // Convert pixel from NES BGR to canvas ABGR
        this.buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
      }
    }
    this.canvasImageData.data.set(this.buf8);
    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
  }

  componentDidMount() {
    this.msgAdd({
      from: '提示',
      msg: '按下enter键向其他玩家发送消息',
    });
    this.msgAdd({
      from: '默认按键设置',
      msg: '上:w    下:s    左:a    右:d    选择:v    确认:b    A:k    B:j    X:i    Y:u',
    });
    this.props.gameTabSet('');
    this.canvasContext = this.refs.screen.getContext('2d');
    this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
    // Get the canvas buffer in 8bit and 32bit
    this.buf = new ArrayBuffer(this.canvasImageData.data.length);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Fill the canvas with black
    this.canvasContext.fillStyle = 'black';
    // set alpha to opaque
    this.canvasContext.fillRect(0, 0, 256, 240);

    console.log(this)
    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xFF000000;
    }
    window.nes.opts.onFrame = (buffer) => {
      var i = 0;
      for (var y = 0; y < 240; ++y) {
        for (var x = 0; x < 256; ++x) {
          i = y * 256 + x;
          // Convert pixel from NES BGR to canvas ABGR
          this.buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
        }
      }
      this.canvasImageData.data.set(this.buf8);
      this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }
    setInterval(
      () => {
        window.nes.frame()
      },
      1000/60
    )
    this.interval = setInterval(
      () => {
        this.setState({ time: this.state.time + 1 });
      },
      1000
    );
    // window.nes.ui.addKeyboard(document.getElementById('window'));
    document.getElementById('window').addEventListener("keyup", (e) => {
      if (e.keyCode == 13) {
        this.setState({ chatHide: !this.state.chatHide });
        if (!this.state.chatHide) {
          document.getElementById('chat').focus();
        }
      }
    })
    this.props.msgSet([]);
    ws.addOnmessage('roomMsg', data => {
      console.log(this.state.msg);
      var msg = {
        from: data.from,
        msg: data.msg,
      }
      this.msgAdd(msg);
    });
  }
  componentWillUnmount() {
    ws.removeOnmessage("roomMsg")
    window.nes.stop();
    clearInterval(this.interval);
  }

  enter(e) {
    if (e.keyCode == 13) {
      var input = document.getElementById('chat');
      var msg = input.value;
      if (msg != '') {
        ws.sendRoomMsg(msg);
        input.value = '';
      }
      this.setState({ chatHide: true });
      document.getElementById('window').focus();
    }
  }

  render() {
    var second = parseInt(this.state.time % 60);
    if (second < 10) {
      second = "0" + second;
    }
    var minutes = parseInt(this.state.time / 60 % 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var hour = parseInt(this.state.time / 3600);
    if (hour < 10) {
      hour = "0" + hour;
    }
    var time = hour + ":" + minutes + ":" + second;
    return (
      <div className='Game'>
        {/* {this.props.gameTab=="Players"?<Players />:
          (this.props.gameTab=="Chat"?<Chat />:
          (this.props.gameTab=="Menu"?<Menu />:
          <div/>))
        } */}
        <div className='buttons'>
          <button disabled>任务</button>
          <button onClick={() => { this.setState({ chatHide: true }); this.props.gameTabSet("Menu"); }}>菜单</button>
          <input type='text' value={time} disabled />
          <button onClick={() => { this.setState({ chatHide: true }); this.props.gameTabSet("Players") }}>玩家</button>
          <button onClick={() => { this.setState({ chatHide: true }); this.props.gameTabSet("Chat") }}>聊天</button>
        </div>
        <div className='window' id='window' tabIndex="0">
          <div id='emulator' className='emulator'>
            <canvas ref='screen' class="nes-screen" width="256" height="240"></canvas>
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
        </div>
        {!this.state.chatHide ?
          <div className='chatBox'>
            <div className='chatInfo'>发送消息：</div>
            <input type='text' className='chat' id='chat' onKeyUp={this.enter.bind(this)} />
          </div>
          :
          <div />
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    room: state.room,
    gameTab: state.gameTab,
    user: state.user,
  }
}

export default connect(mapStateToProps, { roomSet, gameTabSet, msgSet, msgAdd, keyboardGet })(Game);