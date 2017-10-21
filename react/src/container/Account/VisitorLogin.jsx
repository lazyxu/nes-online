import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Form.scss'

import utils from './utils'
import userApi from '../../api/user.js'
import { userSet, tabSet } from '../../actions/actions'
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
      this.props.tabSet('')
      location.reload(true)
    })
  }

  render() {
    return (
      <div className="MaskLayer">
        <div className='Form'>
          <span className="Close" onClick={()=>this.props.tabSet('')}>X</span>
          <h1>游客登录</h1>
          <input type='text' placeholder='为自己取个昵称吧' ref='name' autoComplete="off" autoFocus onKeyUp={e => { if (e.keyCode == 13) this.login() }}/>
          <div className='link'>
            <a onClick={()=>this.props.tabSet('Register')}  className='leftLink'>注册账号</a>
            <a onClick={()=>this.props.tabSet('Login')}  className='rightLink'>已有账号,登录</a>
          </div>
          <button type='button' className='enableButton' onClick={this.login.bind(this)}>游客登录</button>
          <div className='msg' style={{ "color": this.state.login.color }}>{this.state.login.value}</div>
        </div>
      </div>
    )
  }
}

export default connect(null, { userSet, tabSet })(VisitorLogin)