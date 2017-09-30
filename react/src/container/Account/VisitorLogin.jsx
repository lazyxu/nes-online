import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Form.scss'

import utils from './utils'
import userApi from '../../api/user.js'
import { userSet } from '../../actions/actions'
import ws from '../../websocket/index.js'

class VisitorLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      login: { color: "", value: "" },
    }
  }

  login() {
    var name = this.refs.name.value
    userApi.visitorLogin(name).then(resp => {
      if (resp.error) {
        this.setState({ login: { color: 'red', value: resp.msg } })
        return
      }
      this.props.userSet(resp.data)
      ws.create()
      this.setState({ login: { color: 'green', value: resp.msg } })
      location.href = "#/gameList"
    })
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
          <h1>请先登录</h1>
          <input type='text' placeholder='为自己取个昵称吧' ref='name' autoComplete="off" autoFocus />
          <div className='link'>
            <Link to="/register" className='leftLink'>注册账号</Link>
            <Link to="/login" className='rightLink'>已有账号,登录</Link>
          </div>
          <button type='button' className='enableButton' onClick={this.login.bind(this)}>游客登录</button>
          <div className='msg' style={{ "color": this.state.login.color }}>{this.state.login.value}</div>
        </div>
      </div>
    )
  }
}

export default connect(null, { userSet })(VisitorLogin)