import React from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import './Index.scss'
import GameList from './GameList/GameList'
// import UserTab from './UserTab/UserTab'
// import ws from '../utils/websocket'
// import Game from './GameTab/Game.jsx'
// import SettingTab from './SettingTab/SettingTab.jsx'

class Index extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div >
        <div className='Header'>
          <div className='Title'>
            NES Online
          </div>
        </div>
        <div className='Body'>
          {this.props.children}
        </div>
        <div className='Footer'>
          <p>
            <span>Copyright © 2017</span>
            <a href="http://MeteorKL.com/"> MeteorKL</a>
            <a href="http://www.miibeian.gov.cn/" rel="nofollow" target="_blank">浙ICP备 16025067号-1</a></p>
        </div>
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

export default connect(mapStateToProps, null)(Index);