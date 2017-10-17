import React from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import './Index.scss'
import userApi from '../api/user.js'
import constant from '../constant.js'
import Login from './Account/Login'
import VisitorLogin from './Account/VisitorLogin'
import Register from './Account/Register'
import ForgetPassword from './Account/ForgetPassword'
import { userSet, tabSet } from '../actions/actions'
import ws from '../websocket/index.js'
// import jsnes from '../jsnes/index.js'

class Index extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    ws.addOnmessage('relogin', data => {
      alert("您已登录 不能重复登录");
      this.props.userSet(constant.INIT_USER_STATE)
    })
    if ((this.props.tab == null || this.props.tab == '') && this.props.user.type == constant.USER_UNLOGIN) {
      userApi.checkLogin().then(resp => {
        if (resp.error) {
          this.props.tabSet('VisitorLogin')
          return
        }
        this.props.userSet(resp.data)
        ws.create()
      })
    }
  }

  componentDidUpdate() {
    if ((this.props.tab == null || this.props.tab == '') && this.props.user.type == constant.USER_UNLOGIN) {
      this.props.tabSet('VisitorLogin')
    }
  }

  componentDidUnmount() {
    ws.removeOnmessage('relogin')
  }

  logout() {
    userApi.logout().then(resp => {
      this.props.userSet(constant.INIT_USER_STATE)
    })
  }

  render() {
    var userType = this.props.user.type
    var userName = this.props.user.name
    // var userAvatar = this.props.user.avatar
    return (
      <div >
        {this.props.tab == 'VisitorLogin' ? <VisitorLogin /> :
          this.props.tab == 'Login' ? <Login /> :
            this.props.tab == 'Register' ? <Register /> :
              this.props.tab == 'ForgetPassword' ? <ForgetPassword /> :
                <div />
        }
        <div className="Header">
          <a href="#/gameList">
            <img src="/img/logo@48.png" />
          </a>
          <a href="#/gameList">
            NES Online
          </a>
          {userType == -1 ?
            <div className="Navbar">
              <a onClick={() => this.props.tabSet('VisitorLogin')}>游客登录</a><span> | </span>
              <a onClick={() => this.props.tabSet('Register')}>注册</a><span> | </span>
              <a className="CurrentLocation" onClick={() => this.props.tabSet('Login')}>登录</a>
            </div> :
            (userType == 0 ?
              <div className="Navbar">
                <a href="#/settings/account">设置</a><span> | </span>
                <a onClick={() => this.logout()}>注销</a><span> | </span>
                <span> {userName} </span>
              </div> :
              <div className="Navbar">
                <a href="#/settings/account">设置</a><span> | </span>
                <a onClick={() => this.logout()}>注销</a><span> | </span>
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
            <span> Copyright © 2017 </span>
            <a href="http://MeteorKL.com/"> MeteorKL </a>
            <a href="http://www.miibeian.gov.cn/" rel="nofollow" target="_blank"> 浙ICP备 16025067号-1 </a></p>
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

export default connect(mapStateToProps, { userSet, tabSet })(Index)