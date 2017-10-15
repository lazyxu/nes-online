import React from 'react'
import { connect } from 'react-redux'

import './Menu.scss'
import ws from '../../../websocket/index.js'
import { roomSet, gameTabSet, tabSet } from '../../../actions/actions'
// import nesAPI from '../GameAPI.js'
// import KeyboardSetting from './KeyboardSetting.jsx'

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      emulateSound: window.nes.opts.emulateSound,
    }
  }

  end() {
    ws.send({
      "type": "endGame",
    });
  }

  render() {
    return (
      <div className='Menu'>
        <div className='window'>
          <div style={{ textAlign: "center" }}>游戏菜单</div>
          <div className='buttons'>
            {this.props.isRunning ?
              <button onClick={() => { this.props.updateIsRunning(false) }}>暂停游戏</button> :
              <button onClick={() => { this.props.updateIsRunning(true) }}>继续游戏</button>
            }
            <button onClick={() => { this.props.restart() }} >重新开始</button>
            <button onClick={() => this.props.gameTabSet("")} disabled>保存游戏</button>
            <button onClick={() => this.props.gameTabSet("")} disabled>装载游戏</button>
            {this.props.emulateSound ?
              <button onClick={() => { this.props.updateEmulateSound(false) }}>关闭声音</button> :
              <button onClick={() => { this.props.updateEmulateSound(true) }}>打开声音</button>
            }
            <button onClick={() => this.end()}>结束游戏</button>
            <br />
            <button onClick={() => { this.props.closeTab() }}>回到游戏</button>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    game: state.game,
  }
}

export default connect(mapStateToProps, { roomSet, gameTabSet, tabSet })(Menu);