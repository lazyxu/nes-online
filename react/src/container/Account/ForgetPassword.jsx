import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import './Form.scss'
import utils from './utils'
import userApi from '../../api/user.js'
import {tabSet } from '../../actions/actions'

class ForgetPassword extends React.Component {
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
      <div className="MaskLayer">
        <div className='Form'>
          <span className="Close" onClick={()=>this.props.tabSet('')}>X</span>
          <h1>忘记密码</h1>
          <input ref='mail' type='text' placeholder='邮箱' autoFocus />
          <div className='link'>
            <a onClick={()=>this.props.tabSet('Login')} className='leftLink'>想起密码了？登录吧</a>
          </div>
          <button type='button' className='enableButton' onClick={this.forgetPassword.bind(this)}>发送验证邮件</button>
          <div className='msg' style={{ "color": this.state.forgetPassword.color }}>{this.state.forgetPassword.value}</div>
        </div>
      </div>
    )
  }
}

export default connect(null, { tabSet })(ForgetPassword)