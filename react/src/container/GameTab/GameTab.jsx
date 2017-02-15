import React from 'react'
import { connect } from 'react-redux'

import './main.scss'
import GameList from './GameList/GameList'
import GamePreview from './GamePreview/GamePreview'
import RoomList from './RoomList/RoomList'
import Room from './Room/Room'

import actions from '../../actions/actions'

class GameTab extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='GameTab'>
        <div className='Tab'>
          <button className={this.props.tab=='GameList'?'Show':'Hide'} onClick={() => this.props.setGameTab('GameList')}>游戏大厅</button>
          <button className={this.props.tab=='MyGame'?'Show':'Hide'} onClick={() => this.props.setGameTab('MyGame')}>我的游戏</button>
          {this.props.game!='' && <button className={this.props.tab=='GamePreview'?'Show':'Hide'} onClick={() => this.props.setGameTab('GamePreview')}>{this.props.game}</button>}
          {this.props.room!=null && <button className={this.props.tab=='Room'?'Show':'Hide'} onClick={() => this.props.setGameTab('Room')}>房间{this.props.room.id}</button>}
          <button className={this.props.tab=='RoomList'?'room-show':'room-hide'} onClick={() => this.props.setGameTab('RoomList')}>房间列表</button>
          <div className='partition'>|</div>
          <button className='Setting' onClick={() => this.props.setGameTab('Setting')}>游戏设置</button>
        </div>
        {
          this.props.tab=='GameList'?<div className='List'><GameList setGame={this.props.setGame} setGameTab={this.props.setGameTab}/></div>:
          (this.props.tab=='GamePreview'?<div className='List'><GamePreview nes={this.props.nes} setNES={this.props.setNES} game={this.props.game} user={this.props.user} setRoom={this.props.setRoom} setGameTab={this.props.setGameTab}/></div>:
          (this.props.tab=='MyGame'?<div className='List'></div>:
          (this.props.tab=='RoomList'?<div className='List'><RoomList/></div>:
          (this.props.tab=='Room'?<div className='List'><Room game={this.props.game} room={this.props.room}/></div>:
          (this.props.tab=='Setting'?<div className='List'></div>:
          <div className='List'/>)))))
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      game: state.game,
      room: state.room,
      tab: state.gameTab,
      nes: state.nes,
      user: state.user
    }
}

// 将state的指定值映射在props上，将action的所有方法映射在props上
export default connect(mapStateToProps, actions)(GameTab);