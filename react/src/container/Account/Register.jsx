import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import './Form.scss'
import userApi from '../../utils/api/user.js'
import {tabSet } from '../../utils/actions/index.js'

class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checkMail: { color: "", value: "" },
      checkName: { color: "", value: "" },
      checkPassword: { color: "", value: "" },
      buttonEnable: false,
      register: { color: "", value: "" },
    }
  }

  updateCheck(msg, key) {
    if (this.buttonEnable()) {
      this.setState({ key: { color: 'green', value: msg }, buttonEnable: true })
    } else {
      this.setState({ key: { color: 'green', value: msg }, buttonEnable: false })
    }
  }

  checkMail() {
    var mail = this.refs.mail.value
    if (mail == "") {
      this.setState({ checkMail: { color: 'red', value: '请填写你的邮箱地址' }, buttonEnable: false })
      return
    }
    var myreg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
    if (!myreg.test(mail)) {
      this.setState({ checkMail: { color: 'red', value: '请填写有效的邮箱地址' }, buttonEnable: false })
      return
    }
    userApi.checkMail(mail).then(resp => {
      if (resp.error) {
        this.setState({ checkMail: { color: 'red', value: resp.msg }, buttonEnable: false })
      } else {
        if (this.state.checkName.color == "green" && this.state.checkPassword.color == "green") {
          this.setState({ checkMail: { color: 'green', value: resp.msg }, buttonEnable: true })
        } else {
          this.setState({ checkMail: { color: 'green', value: resp.msg }, buttonEnable: false })
        }
      }
    })
  }

  checkName() {
    var name = this.refs.name.value
    if (name.trim() == "") {
      this.setState({ checkName: { color: 'red', value: '昵称不能为空' }, buttonEnable: false })
    } else if (name.indexOf('@') > 0) {
      this.setState({ checkName: { color: 'red', value: '用户名中不允许包含@' }, buttonEnable: false })
    } else {
      userApi.checkName(name).then(resp => {
        if (resp.error) {
          this.setState({ checkName: { color: 'red', value: resp.msg }, buttonEnable: false })
        } else {
          if (this.state.checkMail.color == "green" && this.state.checkPassword.color == "green") {
            this.setState({ checkName: { color: 'green', value: resp.msg }, buttonEnable: true })
          } else {
            this.setState({ checkName: { color: 'green', value: resp.msg }, buttonEnable: false })
          }
        }
      })
    }
  }

  checkPassword() {
    var password = this.refs.password.value
    var rePassword = this.refs.rePassword.value
    if (password == "") {
      this.setState({ checkPassword: { color: 'red', value: '请输入密码' }, buttonEnable: false })
    } else if (password != rePassword) {
      this.setState({ checkPassword: { color: 'red', value: '两次输入的密码不一致' }, buttonEnable: false })
    } else {
      if (this.state.checkMail.color == "green" && this.state.checkName.color == "green") {
        this.setState({ checkPassword: { color: 'green', value: "" }, buttonEnable: true })
      } else {
        this.setState({ checkPassword: { color: 'green', value: "" }, buttonEnable: false })
      }
    }
  }

  register() {
    if (this.state.checkMail.color == "green" && this.state.checkName.color == "green" && this.state.checkPassword.color == "green") {
      var mail = this.refs.mail.value
      var name = this.refs.name.value
      var password = this.refs.password.value
      userApi.register(mail, name, password).then(resp => {
        if (resp.error) {
          this.setState({ register: { color: 'red', value: resp.msg } })
          return
        }
        this.setState({ register: { color: 'green', value: resp.msg } })
      })
    } else {
      this.setState({ buttonEnable: false })
    }
  }

  render() {
    return (
      <div className="MaskLayer">
        <div className='Form'>
          <span className="Close" onClick={()=>this.props.tabSet('')}>X</span>
          <h1>注册</h1>
          <input type='email' placeholder='邮箱' ref='mail' onBlur={this.checkMail.bind(this)} autoFocus />
          <div ref='checkMail' className='msg' style={{ "color": this.state.checkMail.color }}>{this.state.checkMail.value}</div>
          <input type='text' placeholder='用户名' ref='name' onBlur={this.checkName.bind(this)} />
          <div ref='checkName' className='msg' style={{ "color": this.state.checkName.color }}>{this.state.checkName.value}</div>
          <input type='password' placeholder='密码' ref='password' onBlur={this.checkPassword.bind(this)} />
          <input type='password' placeholder='再次输入密码' ref='rePassword' onBlur={this.checkPassword.bind(this)} />
          <div ref='checkPassword' className='msg' style={{ "color": this.state.checkPassword.color }}>{this.state.checkPassword.value}</div>
          <div className='link'>
            <a onClick={()=>this.props.tabSet('Login')}  className='rightLink'>已有帐号？登录</a>
          </div>
          <button type='button' className={this.state.buttonEnable ? 'enableButton' : 'disableButton'} onClick={this.register.bind(this)}>发送注册邮件</button>
          <div ref='register' className='msg' style={{ "color": this.state.register.color }}>{this.state.register.value}</div>
        </div>
      </div>
    )
  }
}

export default connect(null, { tabSet })(Register)