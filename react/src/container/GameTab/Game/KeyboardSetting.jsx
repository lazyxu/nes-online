import React from 'react'
import { connect } from 'react-redux'

import ws from '../../../utils/websocket'
import {roomSet, gameTabSet, tabSet, keyboardSet} from '../../../actions/actions'
import keyboard from '../../../api/user/keyboard.js'

class KeyboardSetting extends React.Component {

  constructor(props) {
    super(props);
    this.state = window.nes.keyboard.player[0];
  }

  setKeyboard() {
    keyboard.update(this.state, data => {
      window.nes.keyboard.player[this.props.user.idInRoom] = this.state;
      document.getElementById('window').focus();
      this.props.gameTabSet('');
    })
  }

  render() {
    return (
      <div className='window'>
        <div style={{textAlign: 'center'}}>键位设置</div>
        <table style={{width: '100%'}}>
          <thead><tr>
            <td width='50%'></td>
            <td width='50%'></td>
          </tr></thead>
          <tbody><tr><td className='key'>上：</td>
            <td><input className='value' id='up' type='text' value={this.state.up} onKeyUp={(e)=>{this.setState({up: e.keyCode});document.getElementById('down').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>下：</td>
            <td><input className='value' id='down' type='text' value={this.state.down} onKeyUp={(e)=>{this.setState({down: e.keyCode});document.getElementById('left').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>左：</td>
            <td><input className='value' id='left' type='text' value={this.state.left} onKeyUp={(e)=>{this.setState({left: e.keyCode});document.getElementById('right').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>右：</td>
            <td><input className='value' id='right' type='text' value={this.state.right} onKeyUp={(e)=>{this.setState({right: e.keyCode});document.getElementById('select').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>选择：</td>
            <td><input className='value' id='select' type='text' value={this.state.select} onKeyUp={(e)=>{this.setState({select: e.keyCode});document.getElementById('start').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>确认：</td>
            <td><input className='value' id='start' type='text' value={this.state.start} onKeyUp={(e)=>{this.setState({start: e.keyCode});document.getElementById('A').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>A：</td>
            <td><input className='value' id='A' type='text' value={this.state.A} onKeyUp={(e)=>{this.setState({A: e.keyCode});document.getElementById('B').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>B：</td>
            <td><input className='value' id='B' type='text' value={this.state.B} onKeyUp={(e)=>{this.setState({B: e.keyCode});document.getElementById('X').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>X：</td>
            <td><input className='value' id='X' type='text' value={this.state.X} onKeyUp={(e)=>{this.setState({X: e.keyCode});document.getElementById('Y').focus()}}/></td>
          </tr></tbody>
          <tbody><tr><td className='key'>Y：</td>
            <td><input className='value' id='Y' type='text' value={this.state.Y} onKeyUp={(e)=>{this.setState({Y: e.keyCode});document.getElementById('up').focus()}}/></td>
          </tr></tbody>
        </table>
        <div className='exitButtons'>
          <button onClick={() => this.setKeyboard()}>确定</button>
          <button onClick={() => {document.getElementById('window').focus();this.props.gameTabSet('')}}>取消</button>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      user: state.user,
      room: state.room,
      keyboard: state.keyboard,
    }
}

export default connect(mapStateToProps, {roomSet, gameTabSet, tabSet, keyboardSet})(KeyboardSetting);