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
      emulateSound: this.props.nes.emulateSound,
    }
  }

  end() {
    ws.send({
      "type": "endGame",
    });
  }

  updateEmulateSound(emulateSound) {
    this.props.nes.updateEmulateSound(emulateSound)
    this.setState({ emulateSound: emulateSound })
  }

  render() {
    return (
      <div className='Menu'>
        <div className='window'>
          <div style={{ textAlign: "center" }}>游戏菜单</div>
          <div className='buttons'>
            {this.props.isRunning ?
              <button onClick={() => this.props.updateIsRunning(false)}>暂停游戏</button> :
              <button onClick={() => this.props.updateIsRunning(true)}>继续游戏</button>
            }
            <button onClick={() => this.props.nes.restart()} >重新开始</button>
            <button disabled>保存游戏</button>
            <button disabled>装载游戏</button>
            {this.state.emulateSound ?
              <button onClick={() => this.updateEmulateSound(false)}>关闭声音</button> :
              <button onClick={() => this.updateEmulateSound(true)}>打开声音</button>
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