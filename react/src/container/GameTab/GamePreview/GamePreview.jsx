import React from 'react'

import './main.scss'
import ws from '../../../utils/websocket'

export default class GamePreview extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      nes: null
    }
  }

  componentDidMount() {
    ws.on('createRoom', (data) => {
      if (data.from==this.props.user.name) {
        this.props.setRoom(data.room);
        this.props.setGameTab('Room');
      }
    });
  }

  create() {
    ws.send({
      "type": "createRoom",
      "game": this.props.game,
    });
  }

  render() {
    return (
      <div className='GamePreview'>
        <div className='window'>
          <img src={'/rom/'+this.props.game+'.jpg'}/>
        </div>
        <div className='gameButtonBox'>
        <table><tbody><tr>
            <td><button onClick={this.create.bind(this)}>创建游戏</button></td>
            <td><button >加入游戏</button></td>
            <td><button >添加收藏</button></td>
          </tr></tbody></table>
        </div>
      </div>
    );
  }
}