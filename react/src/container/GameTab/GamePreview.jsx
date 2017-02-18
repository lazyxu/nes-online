import React from 'react'
import { connect } from 'react-redux'

import './GamePreview.scss'
import ws from '../../utils/websocket'
import {roomSet, tabSet} from '../../actions/actions'

class GamePreview extends React.Component {

  constructor(props) {
    super(props);
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

function mapStateToProps(state) {
    return {
      game: state.game,
      user: state.user
    }
}

export default connect(mapStateToProps, {roomSet, tabSet})(GamePreview);