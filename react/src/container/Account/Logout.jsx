import React from "react"
import { connect } from "react-redux"

import "./Form.scss"
import userApi from "../../utils/api/user.js"
import constant from "../../utils/constant.js"
import { userSet } from "../../utils/actions/index.js"

class Logout extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    userApi.logout().then(res => {
      this.props.userSet(constant.INIT_USER_STATE)
    })
  }

  render() {
    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a><span> | </span>
          <a href="#/roomList/">房间列表</a>
        </div>
        <span style={{ "color": "green" }}>注销成功</span>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    tab: state.tab,
  }
}

export default connect(mapStateToProps, { userSet })(Logout)