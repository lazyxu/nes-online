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
      isRunning: window.nes.isRunning,
      emulateSound: window.nes.opts.emulateSound,
      page: "游戏菜单",
    }
  }

  end() {
    ws.send({
      "type": "endGame",
    });
  }

  render() {
    return (
      <div className='GameTab'>
        {this.state.page == "键位设置" ?
          <KeyboardSetting /> :
          (this.state.page == "游戏菜单" ?
            <div className='menuWindow'>
              <div style={{ textAlign: "center" }}>游戏菜单</div>
              <div className='menuButtons'>
                <button onClick={() => { window.nes.ui.stopOrStart(), this.setState({ isRunning: !this.state.isRunning }) }}>{this.state.isRunning ? '暂停游戏' : '继续游戏'}</button>
                <button onClick={() => { window.nes.restart(), this.setState({ isRunning: true }) }} disabled>重新开始</button>
                <button onClick={() => this.props.gameTabSet("")} disabled>保存游戏</button>
                <button onClick={() => this.props.gameTabSet("")} disabled>装载游戏</button>
                <button onClick={() => { window.nes.ui.emulateSoundChange(), this.setState({ emulateSound: !this.state.emulateSound }) }}>{this.state.emulateSound ? '关闭声音' : '打开声音'}</button>
                <button onClick={() => this.setState({ page: "键位设置" })}>键位设置</button>
                <button onClick={() => this.end()}>结束游戏</button>
                <br />
                <button onClick={() => { this.props.closeTab() }}>回到游戏</button>
              </div>
            </div> :
            <div />)
        }
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