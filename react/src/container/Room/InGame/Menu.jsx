import React from 'react'
import { connect } from 'react-redux'

import './Menu.scss'
import ws from '../../../utils/websocket/index.js'

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
              <button onClick={() => this.props.updateIsRunning(false)} disabled>暂停游戏</button> :
              <button onClick={() => this.props.updateIsRunning(true)} disabled>继续游戏</button>
            }
            {<button disabled >重新开始</button>}
            <button disabled>保存游戏</button>
            <button disabled>装载游戏</button>
            {this.props.emulateSound ?
              <button onClick={() => this.props.updateEmulateSound(false)}>关闭声音</button> :
              <button onClick={() => this.props.updateEmulateSound(true)}>打开声音</button>
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

export default Menu;