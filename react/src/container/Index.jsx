import React from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import './Index.scss'
import userApi from '../api/user.js'
import constant from '../constant.js'
import { userSet } from '../actions/actions'
import ws from '../websocket/index.js'

class Index extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    userApi.checkLogin()
  }

  componentDidUpdate() {
    userApi.checkLogin()
  }

  render() {
    var userType = this.props.user.type
    var userName = this.props.user.name
    // var userAvatar = this.props.user.avatar
    return (
      <div >
        <div className="Header">
          <a href="#/gameList">
            <img src="/img/logo@48.png" />
          </a>
          <a href="#/gameList">
            NES Online
          </a>
          {userType == -1 ?
            <div className="Navbar">
              <a href="#/visitorLogin">游客登录</a><span> | </span>
              <a href="#/register">注册</a><span> | </span>
              <a className="CurrentLocation" href="#/login/">登录</a>
            </div> :
            (userType == 0 ?
              <div className="Navbar">
                <a href="#/settings/account">设置</a><span> | </span>
                <span> {userName} </span>
              </div> :
              <div className="Navbar">
                <a href="#/settings/account">设置</a><span> | </span>
                <a href="#/logout">注销</a><span> | </span>
                <span>{userName}</span>
                {/* <img src={userAvatar} /> */}
              </div>
            )
          }
        </div>
        <div className="Body">
          {this.props.children}
        </div>
        <div className="Footer">
          <p>
            <span>Copyright © 2017</span>
            <a href="http://MeteorKL.com/"> MeteorKL</a>
            <a href="http://www.miibeian.gov.cn/" rel="nofollow" target="_blank">浙ICP备 16025067号-1</a></p>
        </div>
      </div >
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    tab: state.tab,
  }
}

export default connect(mapStateToProps, { userSet })(Index)