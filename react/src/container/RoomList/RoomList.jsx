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
      roomList: []
    }
    this.interval = null
  }

  componentDidMount() {
    ws.addOnmessage("getRoomList", roomList =>
      this.setState({roomList: roomList})
    )
    this.interval = setInterval(() => {
      ws.send({
        type: "getRoomList"
      })
    }, 10000)
  }

  componentWillUnmount() {
    if (this.interval != null) {
      clearInterval(this.interval)
    }
    ws.removeOnmessage("getRoomList")
  }

  enter(id) {
    if (this.state.roomList[id].state != "游戏中") {
      ws.send({
        "type": "enterRoom",
        "roomID": id,
      });
    }
  }

  render() {
    var list = [];
    for (var index in this.props.roomList) {
      if (index & 1) {
        list.push(
          <tbody key={index} onClick={this.enter.bind(this, index)}>
            <tr className='odd'>
              <td>{this.state.roomList[index].id}</td>
              <td>{this.state.roomList[index].name}</td>
              <td>{this.state.roomList[index].host}</td>
              <td>{this.state.roomList[index].game}</td>
              <td>{this.state.roomList[index].number}</td>
              <td>{this.state.roomList[index].state}</td>
            </tr>
          </tbody>
        )
      }
      else {
        list.push(
          <tbody key={index} onClick={this.enter.bind(this, index)}>
            <tr className='even'>
              <td>{this.state.roomList[index].id}</td>
              <td>{this.state.roomList[index].name}</td>
              <td>{this.state.roomList[index].host}</td>
              <td>{this.state.roomList[index].game}</td>
              <td>{this.state.roomList[index].number}</td>
              <td>{this.state.roomList[index].state}</td>
            </tr>
          </tbody>
        )
      }
    }

    return (
      <div>
        <div className="LocationBar">
          <a href="#/gameList">游戏大厅</a> | <a className="CurrentLocation" href="#/roomList/">房间列表</a>
        </div>
        <div className='RoomList' id='RoomList'>
          <table>
            <thead><tr>
              <td width='10%'>房间号</td>
              <td width='20%'>房间名</td>
              <td width='20%'>房主</td>
              <td width='30%'>游戏名称</td>
              <td width='10%'>人数</td>
              <td width='10%'>状态</td>
            </tr></thead>
            {list}
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