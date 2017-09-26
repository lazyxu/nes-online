import React from 'react'
import { Link } from 'react-router'

import './Form.scss'
import utils from './utils'
import userApi from '../../api/user.js'

export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkPassword: { color: "", value: "" },
      resetPassword: { color: "", value: "" },
      buttonEnable: false,
    }
  }

  resetPassword() {
    var mail = this.refs.mail.value
    var verifyCode = this.props.params.verifyCode
    var password = this.refs.password.value
    userApi.resetPassword(mail, verifyCode, password).then(resp => {
      if (resp.error) {
        this.setState({ resetPassword: { color: 'red', value: resp.msg } })
        return
      }
      this.setState({ resetPassword: { color: 'green', value: resp.msg } })
    });
  }

  checkPassword() {
    var password = this.refs.password.value
    var rePassword = this.refs.rePassword.value
    if (password == "") {
      this.setState({ checkPassword: { color: 'red', value: '请输入密码' }, buttonEnable: false })
    } else if (password != rePassword) {
      this.setState({ checkPassword: { color: 'red', value: '两次输入的密码不一致' }, buttonEnable: false })
    } else {
      this.setState({ checkPassword: { color: 'green', value: '' }, buttonEnable: true })
    }
  }

  render() {
    return (
      <div className='Form'>
        <h1>重置密码</h1>
        <input type='text' placeholder='邮箱' ref='mail'/>
        <input type='password' placeholder='密码' ref='password' onBlur={this.checkPassword.bind(this)} />
        <input type='password' placeholder='再次输入密码' ref='rePassword' onBlur={this.checkPassword.bind(this)} />
        <div ref='checkPassword' className='msg' style={{ "color": this.state.checkPassword.color }}>{this.state.checkPassword.value}</div>
        <button type='button' className={this.state.buttonEnable ? 'enableButton' : 'disableButton'} onClick={this.resetPassword.bind(this)}>重置密码</button>
        <div ref='checkRegister' className='msg' style={{ "color": this.state.resetPassword.color }}>{this.state.resetPassword.value}</div>
      </div>
    )
  }
}