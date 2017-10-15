import React from 'react'
import { connect } from 'react-redux'

import './Keyboard.scss'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import keyboardApi from '../../../api/keyboard.js'
import { roomSet, gameTabSet, tabSet, keyboardSet } from '../../../actions/actions'

class Keyboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.props.keyboard
  }

  render() {
    return (
      <div className='Room-InGame-Tab Keyboard'>
        <div className='window'>
          <div style={{ textAlign: 'center' }}>按键设置</div>
          <table style={{ width: '100%' }}>
            <thead><tr>
              <td width='50%'></td>
              <td width='50%'></td>
            </tr></thead>
            <tbody><tr><td className='key'>上：</td>
              <td><input className='value' ref='up' type='text'
                value={constant.KEYCODE_TABLE[this.state.up]}
                onKeyUp={(e) => { this.setState({ up: e.keyCode }); this.refs.down.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>下：</td>
              <td><input className='value' ref='down' type='text'
                value={constant.KEYCODE_TABLE[this.state.down]}
                onKeyUp={(e) => { this.setState({ down: e.keyCode }); this.refs.left.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>左：</td>
              <td><input className='value' ref='left' type='text'
                value={constant.KEYCODE_TABLE[this.state.left]}
                onKeyUp={(e) => { this.setState({ left: e.keyCode }); this.refs.right.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>右：</td>
              <td><input className='value' ref='right' type='text'
                value={constant.KEYCODE_TABLE[this.state.right]}
                onKeyUp={(e) => { this.setState({ right: e.keyCode }); this.refs.select.focus() }} /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>选择：</td>
              <td><input className='value' ref='select' type='text'
                value={constant.KEYCODE_TABLE[this.state.select]}
                onKeyUp={(e) => { this.setState({ select: e.keyCode }); this.refs.start.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>确认：</td>
              <td><input className='value' ref='start' type='text'
                value={constant.KEYCODE_TABLE[this.state.start]}
                onKeyUp={(e) => { this.setState({ start: e.keyCode }); this.refs.A.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>A：</td>
              <td><input className='value' ref='A' type='text'
                value={constant.KEYCODE_TABLE[this.state.A]}
                onKeyUp={(e) => { this.setState({ A: e.keyCode }); this.refs.B.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>B：</td>
              <td><input className='value' ref='B' type='text'
                value={constant.KEYCODE_TABLE[this.state.B]}
                onKeyUp={(e) => { this.setState({ B: e.keyCode }); this.refs.X.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>X：</td>
              <td><input className='value' ref='X' type='text'
                value={constant.KEYCODE_TABLE[this.state.X]}
                onKeyUp={(e) => { this.setState({ X: e.keyCode }); this.refs.Y.focus() }}
              /></td>
            </tr></tbody>
            <tbody><tr><td className='key'>Y：</td>
              <td><input className='value' ref='Y' type='text'
                value={constant.KEYCODE_TABLE[this.state.Y]}
                onKeyUp={(e) => { this.setState({ Y: e.keyCode }); this.refs.up.focus() }}
              /></td>
            </tr></tbody>
          </table>
          <div className='exitButtons'>
            <button onClick={() => { this.props.updateKeyboard(this.state); this.props.closeTab() }}>确定</button>
            <button onClick={() => { this.props.closeTab() }}>取消</button>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}

export default connect(mapStateToProps, { roomSet, gameTabSet, tabSet, keyboardSet })(Keyboard);