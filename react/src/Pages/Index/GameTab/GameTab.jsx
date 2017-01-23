import './main.scss';
import React from 'react';
import GameList from './GameList/GameList';

export default class GameTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {tab: 0};
  }
  render() {
    return (
      <div className='GameTab'>
        <div className='Tab'>
          <button className={this.state.tab==0?'Show':'Hide'} onClick={() => this.setState({tab: 0})}>游戏大厅</button>
          <button className={this.state.tab==1?'Show':'Hide'} onClick={() => this.setState({tab: 1})}>房间列表</button>
          <button className='Setting' onClick={() => this.setState({tab: 3})}>游戏设置</button>
        </div>
        {this.state.tab==0?<GameList />:<div className='List'/>}
      </div>
    )
  }
}