import React from 'react'
import { connect } from 'react-redux'

import './Players.scss'
import ws from '../../../utils/websocket'
import {roomSet, gameTabSet} from '../../../actions/actions'

class Players extends React.Component {

  constructor(props) {
    super(props);
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
        <div className='window'>
          <div style={{textAlign: "center"}}>玩家列表</div>
          <table style={{width: '100%'}}>
            <thead><tr>
              <td width='50px'></td>
              <td width='auto'></td>
              <td width='50px'></td>
            </tr></thead>
            {list}
          </table>
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
    }
}

export default connect(mapStateToProps, {roomSet, gameTabSet})(Players);