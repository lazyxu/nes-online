import React from 'react'
import { connect } from 'react-redux'

import './Chat.scss'
import ws from '../../../utils/websocket'
import {roomSet, gameTabSet} from '../../../actions/actions'
import Scroll from '../../../components/Scroll.jsx'

class Chat extends React.Component {

  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='GameTab'>
        <div className='window'>
          <div style={{textAlign: "center"}}>聊天纪录</div>
          <div id='historyBox' className='historyBox'>
            <div id='history' className='history'>
              {this.props.msg.map((msg, index)=>{
                return (
                  <div className='list' key={index}>
                    <span style={{color: 'green'}}>[{msg.from}]: </span>
                    <span style={{color: 'white'}}>{msg.msg}</span>
                  </div>
                )
              })}
            </div>
            <Scroll 
              mainBoxID='historyBox'
              contentID='history'
              scrollUpdate={this.props.msg.length}
            />
          </div>
          <div className='exitButtons'>
            <button onClick={() => {document.getElementById('window').focus();this.props.gameTabSet("")}}>确定</button>
            <button onClick={() => {document.getElementById('window').focus();this.props.gameTabSet("")}}>取消</button>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      game: state.game,
      room: state.room,
      msg: state.msg,
    }
}

export default connect(mapStateToProps, {roomSet, gameTabSet})(Chat);