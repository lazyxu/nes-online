import React from 'react'
import { connect } from 'react-redux'

import './RoomList.scss'
import ws from '../../utils/websocket'
import Scroll from '../../components/Scroll.jsx'
import {roomlistSet} from '../../actions/actions.js'

class RoomList extends React.Component {

  constructor(props) {
    super(props);
  }

  enter(id) {
    if (this.props.roomlist[id].state!="游戏中") {
      ws.send({
        "type": "enterRoom",
        "roomID": id,
      });
    }
  }

  render() {
    var list=[];
    for (var index in this.props.roomlist) {
      if (index & 1) {
        list.push(
          <tbody key={index} onClick={this.enter.bind(this, index)}>
            <tr className='odd'>
              <td>{this.props.roomlist[index].id}</td>
              <td>{this.props.roomlist[index].name}</td>
              <td>{this.props.roomlist[index].host}</td>
              <td>{this.props.roomlist[index].game}</td>
              <td>{this.props.roomlist[index].number}</td>
              <td>{this.props.roomlist[index].state}</td>
            </tr>
          </tbody>
        )
      }
      else {
        list.push(
          <tbody key={index} onClick={this.enter.bind(this, index)}>
            <tr className='even'>
              <td>{this.props.roomlist[index].id}</td>
              <td>{this.props.roomlist[index].name}</td>
              <td>{this.props.roomlist[index].host}</td>
              <td>{this.props.roomlist[index].game}</td>
              <td>{this.props.roomlist[index].number}</td>
              <td>{this.props.roomlist[index].state}</td>
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
      roomlist: props.roomlist,
    }
}

export default connect(mapStateToProps, null)(RoomList);