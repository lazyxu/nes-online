import React from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import './main.scss'
import GameTab from './GameTab/GameTab'
import UserTab from './UserTab/UserTab'
import ws from '../utils/websocket'
import Game from './GameTab/Game.jsx'
import SettingTab from './SettingTab/SettingTab.jsx'

class App extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.user == null) {
      location.href = "#/login";
      return
    }
    ws.createWS(this.props.user);
  }
  render() {
    if (this.props.user == null) {
      return (
        <div />
      )
    }
    var Header = (
      <div className='Header'>
        <div className='title'>
          NES Online
        </div>
      </div>
    )
    var Footer = (
      <footer>
        <p>
          <i class="fa fa-copyright"> 2017</i>
          <a href="http://MeteorKL.com/"> MeteorKL</a>
          <a href="http://www.miibeian.gov.cn/" rel="nofollow" target="_blank">浙ICP备 16025067号-1</a></p>
      </footer>
    )
    var Account = (
      <div className='Account'>
        <div className='user'>
          <img src={this.props.user.avatar} />
          <input value={this.props.user.name} disabled></input>
        </div>
      </div>
    )
    return (
      <div >
        {this.props.children}
        {this.props.tab == 'Game' ? <Game /> : <div />}
        {Header}
        {Account}
        <GameTab />
        <UserTab user={this.props.user} />
        <SettingTab />
        {Footer}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    tab: state.tab,
  }
}

export default connect(mapStateToProps, null)(App);