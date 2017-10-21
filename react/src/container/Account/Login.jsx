import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Form.scss'

import userApi from '../../utils/api/user.js'
import { userSet, tabSet } from '../../utils/actions/index.js'
import ws from '../../utils/websocket/index.js'
import constant from '../../utils/constant.js'

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
      if (resp.error) {
        this.setState({ login: { color: 'red', value: resp.msg } })
        return
      }
      this.props.userSet(resp.data)
      ws.create()
      this.setState({ login: { color: 'green', value: resp.msg } })
      this.props.tabSet('')
      location.reload(true)
    })
  }

  render() {
    return (
      <div className="MaskLayer" >
        <div className='Form'>
          <span className="Close" onClick={()=>this.props.tabSet('')}>X</span>
          <h1>登录</h1>
          <input type='text' placeholder='用户名/邮箱' ref='account' autoComplete="off" autoFocus />
          <input type='password' placeholder='密码' ref='password' autoComplete="off" onKeyUp={e => { if (e.keyCode == 13) this.login() }} />
          <div className='link'>
            <a onClick={()=>this.props.tabSet('Register')} className='leftLink'>没有帐号？</a>
            <a onClick={()=>this.props.tabSet('ForgetPassword')} className='rightLink'>忘记密码？</a>
          </div>
          <button type='button' className='enableButton' onClick={this.login.bind(this)}>登 录</button>
          <div className='msg' style={{ "color": this.state.login.color }}>{this.state.login.value}</div>
          <p>快捷登录</p>
          <a href='https://github.com/login/oauth/authorize?client_id=2443d910b04cd68c5a66&scope='>
            <img src="/img/github.png" />
          </a>
          {/* <a href={'/api/qqLoginRedirect?redirect_uri='+document.location.href}>
            <img src="/img/qq.png" />
          </a> */}
        </div>
      </div>
    )
  }
}

export default connect(null, { userSet, tabSet })(Login)