import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Form.scss'

import utils from './utils'
import userApi from '../../api/user.js'
import { userSet } from '../../actions/actions'
import ws from '../../utils/websocket.js'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      login: { color: "", value: "" },
    }
  }

  login() {
    var account = this.refs.account.value
    var password = this.refs.password.value
    userApi.login(account, password).then(resp => {
      console.log(resp)
      if (resp.error) {
        this.setState({ login: { color: 'red', value: resp.msg } })
        return
      }
      this.props.userSet(resp.data)
      this.setState({ login: { color: 'green', value: resp.msg } })
      location.href = "#/gameList"
    })
  }

  render() {
    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a><span> | </span>
          <a href="#/roomList/">房间列表</a>
        </div>
        <div className='Form'>
          <input type='text' placeholder='用户名/邮箱' ref='account' autoComplete="off" autoFocus />
          <input type='password' placeholder='密码' ref='password' autoComplete="off" onKeyUp={e => { if (e.keyCode == 13) this.login() }} />
          <div className='link'>
            <Link to="/register" className='leftLink'>没有帐号？</Link>
            <Link to="/forgetPassword" className='rightLink'>忘记密码？</Link>
          </div>
          <button type='button' className='enableButton' onClick={this.login.bind(this)}>登 录</button>
          <div className='msg' style={{ "color": this.state.login.color }}>{this.state.login.value}</div>
          <p>快捷登录</p>
          <a href='https://github.com/login/oauth/authorize?client_id=2443d910b04cd68c5a66&scope='>
            <img src="/img/github.png" />
          </a>
        </div>
      </div>
    )
  }
}

export default connect(null, { userSet })(Login)