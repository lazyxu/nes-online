import React from 'react'
import { connect } from 'react-redux'

import './Chat.scss'
import jsnes from '../../../jsnes/index.js'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'

class Chat extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      msg: [],
      hide: true
    }
  }

  chatBox(e) {
    if (e.keyCode == 13) {
      this.setState({ hide: !this.state.hide })
      if (!this.state.hide) {
        this.refs.chat.focus()
      }
    }
  }

  componentDidMount() {
    ws.addOnmessage('roomMsg', data => {
      var msg = {
        from: data.from,
        msg: data.msg,
      }
      this.state.msg.push(msg)
      setTimeout( () => {
          this.state.msg.shift();
          this.setState({msg: this.state.msg});
        },
        1000*15
      );
      this.setState({ msg: this.state.msg })
    })
    document.addEventListener('keyup', this.chatBox.bind(this))
  }

  componentWillUnmount() {
    ws.removeOnmessage("roomMsg")
    document.removeEventListener('keyup', this.chatBox.bind(this))
  }

  enter(e) {
    if (e.keyCode == 13) {
      var msg = this.refs.chat.value;
      if (msg != '') {
        ws.send({
          "type": "roomMsg",
          "msg": msg
        })
        this.refs.chat.value = '';
      }
      this.setState({ chatHide: true });
      document.getElementById('window').focus();
    }
  }

  render() {
    return (
      <div className="Chat">
        <div className='chatHistory'>
          {this.state.msg.map((msg, index) => {
            return (
              <div className='list' key={index}>
                <span style={{ color: 'green' }}>[{msg.from}]: </span>
                <span style={{ color: 'white' }}>{msg.msg}</span>
              </div>
            )
          })}
        </div>
        {!this.state.hide ?
          <div className='chatBox'>
            <div className='chatInfo'>发送消息：</div>
            <input type='text' className='chat' ref='chat' onKeyUp={this.enter.bind(this)} />
          </div>
          :
          <div />
        }
      </div >
    )
  }
}

export default Chat