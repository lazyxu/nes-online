import React from 'react'
import { connect } from 'react-redux'

import './GameTab.scss'
import GameList from './GameList'
import GamePreview from './GamePreview'
import RoomList from './RoomList'
import Room from './Room'
import Game from './Game.jsx'
import tabSet from '../../actions/actions'

class GameTab extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='TabList'>
        <div className='Tab'>
          <button className={this.props.tab=='GameList'?'Show':'Hide'} onClick={() => this.props.tabSet('GameList')}>游戏大厅</button>
          <button className={this.props.tab=='MyGame'?'Show':'Hide'} onClick={() => this.props.tabSet('MyGame')}>我的游戏</button>
          {this.props.game!='' && <button className={this.props.tab=='GamePreview'?'Show':'Hide'} onClick={() => this.props.tabSet('GamePreview')}>{this.props.game}</button>}
          {this.props.room!=null && <button className={this.props.tab=='Room'?'Show':'Hide'} onClick={() => this.props.tabSet('Room')}>房间{this.props.room.id}</button>}
          <button className={this.props.tab=='RoomList'?'room-show':'room-hide'} onClick={() => this.props.tabSet('RoomList')}>房间列表</button>
          <div className='partition'>|</div>
          <button className='Setting' onClick={() => this.props.tabSet('Setting')}>游戏设置</button>
        </div>
        <div className='List'>
        {
          this.props.tab=='GameList'?<GameList/>:
          (this.props.tab=='GamePreview'?<GamePreview/>:
          (this.props.tab=='MyGame'?<div/>:
          (this.props.tab=='RoomList'?<RoomList/>:
          (this.props.tab=='Room'?<Room/>:
          (this.props.tab=='Setting'?<div/>:
          <div/>)))))
        }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      tab: state.tab,
      game: state.game,
      room: state.room
    }
}

export default connect(mapStateToProps, tabSet)(GameTab);