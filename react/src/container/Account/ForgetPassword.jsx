import React from 'react'
import { Link } from 'react-router'

import './Form.scss'
import utils from './utils'
import userApi from '../../api/user.js'

export default class ForgetPassword extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      forgetPassword: { color: "", value: "" },
    }
  }

  forgetPassword() {
    var mail = this.refs.mail.value
    userApi.forgetPassword(mail).then(resp => {
      if (resp.error) {
        this.setState({ forgetPassword: { color: 'red', value: resp.msg } })
        return
      }
      this.setState({ forgetPassword: { color: 'green', value: resp.msg } })
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
          <input ref='mail' type='text' placeholder='邮箱' autoFocus />
          <div className='link'>
            <Link to="/login" className='leftLink'>想起密码了？登录吧</Link>
          </div>
          <button type='button' className='enableButton' onClick={this.forgetPassword.bind(this)}>发送验证邮件</button>
          <div className='msg' style={{ "color": this.state.forgetPassword.color }}>{this.state.forgetPassword.value}</div>
        </div>
      </div>
    )
  }
}