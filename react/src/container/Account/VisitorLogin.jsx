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

class VisitorLogin extends React.Component {
  constructor(props) {
    super(props)
  }

  login() {
    // var account = this.refs.account.value
    // var password = this.refs.password.value
    // api.login(account, password, (data) => {
    //   var id = 'check'
    //   if (!data.state) {
    //     utils.msgERR(id, data.msg)
    //     return
    //   }
    //   this.props.userSet(data.user)
    //   utils.msgOK(id, data.msg)
    //   location.href = "#/gameList"
    // })
  }

  enter(e) {
    if (e.keyCode == 13)
      this.login()
  }

  render() {
    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a><span> | </span>
          <a href="#/roomList/">房间列表</a>
        </div>
        <div className='Form'>
          <input type='text' placeholder='为自己取个昵称吧' ref='account' autoComplete="off" autoFocus />
          <div className='link'>
            <Link to="/register" className='leftLink'>注册账号</Link>
            <Link to="/login" className='rightLink'>用户登录</Link>
          </div>
          <button type='button' className='enableButton' onClick={this.login.bind(this)}>游客登录</button>
        </div>
      </div>
    )
  }
}

export default connect(null, { userSet })(VisitorLogin)