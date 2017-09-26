import React from 'react'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'

import './Form.scss'
import userApi from '../../api/user.js'

export default class Active extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active: { color: "black", value: "正在激活账户..." },
    }
  }

  componentDidMount() {
    userApi.active(this.props.params.active_code).then(resp => {
      setTimeout(function () {
        location.href = "#/"
      }, 3000)
      if (resp.error) {
        this.setState({ active: { color: 'red', value: resp.msg + ' 3s后跳转到登录界面' } })
        return
      }
      this.setState({ active: { color: 'green', value: resp.msg + ' 3s后跳转到登录界面' } })
    })
  }

  render() {
    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a><span> | </span>
          <a href="#/roomList/">房间列表</a>
        </div>
        <span style={{ "color": this.state.active.color }}>{this.state.active.value}</span>
      </div>
    )
  }
}
