import React from 'react'

import './main.scss'
import api from '../../../api/index.js'
import ws from '../../../utils/websocket'


export default class GameList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"rooms": []};
  }

  componentDidMount() {
    api.listRoom((rooms) => {
      if (rooms==null) {
        this.setState({"rooms": new Object()});
      } else {
        this.setState({"rooms": rooms});
      }
      // new addScroll('GameList-Box','GameList','scrollDiv');
    });
  }

  render() {
    var list=[];
    for (var id in this.state.rooms) {
      if (id&1) {
        list.push(
          <tbody key={id}>
            <tr className='odd'>
              <td>{this.state.rooms[id].id}</td>
              <td>{this.state.rooms[id].name}</td>
              <td>{this.state.rooms[id].game}</td>
              <td>{this.state.rooms[id].number}</td>
            </tr>
          </tbody>
        )
      }
      else {
        list.push(
          <tbody key={id}>
            <tr className='even'>
              <td>{this.state.rooms[id].id}</td>
              <td>{this.state.rooms[id].name}</td>
              <td>{this.state.rooms[id].game}</td>
              <td>{this.state.rooms[id].number}</td>
            </tr>
          </tbody>
        )
      }
    }
    return (
      <div className="RoomList">
        <div className='rooms'>
          <table>
            <thead><tr>
              <td width='20%'>房间号</td>
              <td width='30%'>房间名称</td>
              <td width='30%'>游戏名称</td>
              <td width='20%'>房间人数</td>
            </tr></thead>
            {list}
          </table>
        </div>
      </div>
    );
  }
}
