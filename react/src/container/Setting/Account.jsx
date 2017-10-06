import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import './Setting.scss'
import ws from '../../utils/websocket'
import Scroll from '../../components/Scroll.jsx'
import { userSet } from '../../actions/actions'
import utils from './utils'
import userApi from '../../api/user.js'

class Account extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      checkName: { color: "", value: "" },
      checkPassword: { color: "", value: "" },
      buttonEnable: false,
    }
  }

  changeName() {
    var name = this.refs.name.value
    if (name == this.props.user.name) {
      this.setState({ checkName: { color: 'red', value: '昵称未修改' } })
      return
    }
    if (name == "") {
      this.setState({ checkName: { color: 'red', value: '昵称不能为空' } })
      return
    }
    if (name.indexOf('@') > 0) {
      this.setState({ checkName: { color: 'red', value: '昵称中不允许包含@' } })
      return
    }
    userApi.changeName(name).then(resp => {
      if (resp.error) {
        this.setState({ checkName: { color: 'red', value: resp.msg } })
        return
      }
      this.props.userSet(resp.data)
      this.setState({ checkName: { color: 'green', value: resp.msg } })
    })
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

  changePassword() {
    if (this.state.buttonEnable) {
      var oldPassword = this.refs.oldPassword.value
      var password = this.refs.password.value
      userApi.changePassword(oldPassword, password).then(resp => {
        if (resp.error) {
          this.setState({ checkPassword: { color: 'red', value: resp.msg } })
          return
        }
        this.setState({ checkPassword: { color: 'green', value: resp.msg } })
      })
    }
  }

  render() {
    return (
      <div>
        <div className="LocationBar">
          <a className="CurrentLocation" href="#/settings/account">账户设置</a><span> | </span>
          <a href="#/settings/game">游戏设置</a><span> | </span>
          <a href="#/settings/local">本地设置</a>
        </div>
        <div className="Setting">
          <div className='Item'>
            <input type='text' ref='name' placeholder={this.props.user.name} />
            <div className='msg' style={{ "color": this.state.checkName.color }}>{this.state.checkName.value}</div>
            <button type='button' className='enableButton' onClick={this.changeName.bind(this)}>修改昵称</button>
          </div>
          {this.props.user.mail ?
            <div className='Item'>
              <input type='password' ref='oldPassword' placeholder='旧密码' />
              <Link to="/forgetPassword">忘记密码？</Link>
              <input type='password' ref='password' placeholder='新密码' onBlur={this.checkPassword.bind(this)} />
              <input type='password' ref='rePassword' placeholder='确认新密码' onBlur={this.checkPassword.bind(this)} />
              <div className='msg' style={{ "color": this.state.checkPassword.color }}>{this.state.checkPassword.value}</div>
              <button type='button' className={this.state.buttonEnable ? 'enableButton' : 'disableButton'} onClick={this.changePassword.bind(this)}>修改密码</button>
            </div>
            : <div className='Item'></div>
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    keyboard: state.keyboard,
    user: state.user,
  }
}

export default connect(mapStateToProps, { userSet })(Account)