import React from 'react'
import { connect } from 'react-redux'

import './RoomList.scss'
import ws from '../../websocket/index.js'
import Scroll from '../../components/Scroll.jsx'
import { roomListSet } from '../../actions/actions.js'

class RoomList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      roomList: null
    }
    this.interval = null
  }

  componentDidMount() {
    ws.addOnmessage("roomList", data =>
      this.setState({ roomList: data.roomList })
    )
    ws.send({
      type: "getRoomList"
    })
  }

  componentWillUnmount() {
    ws.removeOnmessage("roomList")
  }

  enter(id) {
    if (this.state.roomList[id].state != "游戏中") {
      location.href = '#/room/' + this.state.roomList[id].id
    }
  }

  render() {
    var roomList = []
    if (this.state.roomList != null) {
      this.state.roomList.forEach((room, i)=> {
        roomList.push(
          <tbody key={i} onClick={() => this.enter(i)}>
            <tr className={i & 1 ? 'even' : 'odd'}>
              <td>{room.id}</td>
              <td>{room.host}</td>
              <td>{room.game}</td>
              <td>{room.number}</td>
              <td>{room.state}</td>
            </tr>
          </tbody>
        )
      })
    }

    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a> | <a className="CurrentLocation" href="#/roomList/">房间列表</a>
        </div>
        <div className='RoomList' id='RoomList'>
          <table>
            <thead><tr>
              <td width='15%'>房间号</td>
              <td width='20%'>房主</td>
              <td width='30%'>游戏名称</td>
              <td width='10%'>人数</td>
              <td width='15%'>状态</td>
            </tr></thead>
            {roomList}
          </table>
        </div>
      </div>
    );
  }
}

function mapStateToProps(props) {
  return {
    roomList: props.roomList,
  }
}

export default connect(mapStateToProps, null)(RoomList);