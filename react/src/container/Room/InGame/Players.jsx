import React from 'react'
import { connect } from 'react-redux'

import './Players.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import { roomSet, gameTabSet } from '../../../actions/actions'

class Players extends React.Component {

  constructor(props) {
    super(props);
  }
  render() {
    var list = [];
    var button = "";
    for (var i in this.props.room.players) {
      if (this.props.room.players[i] != null) {
        var playerName = this.props.room.players[i].name
        var playerAvatar = this.props.room.players[i].avatar
        var playerState = this.props.room.players[i].state_in_room
        var host_id = this.props.room.host_id
        list.push(
          <tbody key={i}><tr>
            <td><span>玩家{parseInt(i) + 1}</span></td>
            <td style={{ textAlign: "center" }}><img className='gameTabAvatar' src={playerAvatar} /></td>
            <td><span>{playerName}</span></td>
            <td><span>{constant.ROOM_PLAYER_STATE_TEXT[playerState]}</span></td>
          </tr></tbody>
        )
      }
    }
    return (
      <div className='GameTab'>
        <div className='window'>
          <div style={{ textAlign: "center" }}>玩家列表</div>
          <table style={{ width: '100%' }}>
            <thead><tr>
              <td width='50px'></td>
              <td width='auto'></td>
              <td width='50px'></td>
              <td width='50px'></td>
            </tr></thead>
            {list}
          </table>
          <div className='exitButtons'>
            <button onClick={() => { document.getElementById('window').focus(); this.props.closeTab() }}>确定</button>
            <button onClick={() => { document.getElementById('window').focus(); this.props.closeTab() }}>取消</button>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    game: state.game,
  }
}

export default connect(mapStateToProps, { roomSet, gameTabSet })(Players);