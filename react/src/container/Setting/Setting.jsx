import React from 'react'
import { connect } from 'react-redux'

import './Setting.scss'
import ws from '../../utils/websocket'
import Scroll from '../../components/Scroll.jsx'
import {roomSet, tabSet} from '../../actions/actions'
import utils from './utils'
import userApi from '../../api/user.js'

class Setting extends React.Component {

  constructor(props) {
    super(props);
  }

  checkName() {
    var name = document.getElementById('name').value;
    this.setState({name: name});
    var id = 'checkName';
    if (name==this.props.user.name) {
      document.getElementById('save').disabled = false;
      console.log(name);
      return
    }
    if (name=="") {
      utils.msgERR(id, '昵称不能为空');
      document.getElementById('save').disabled = true;
      return
    }
    if (name.indexOf('@')>0) {
      utils.msgERR(id, '昵称中不允许包含@');
      document.getElementById('save').disabled = true;
      return
    }
    api.checkName(name, (data) => {
      if (!data.state) {
        utils.msgERR(id, data.msg);
        document.getElementById('save').disabled = true;
        return
      }
      utils.msgOK(id, data.msg);
      document.getElementById('save').disabled = false;
    });
  }
  
  render() {
    return (
      <div>
        <button className='SettingButton' onClick={()=>{
          this.setState({
            hidden: false,
            name: this.props.user.name,
            up: this.props.keyboard.up,
            down: this.props.keyboard.down,
            left: this.props.keyboard.left,
            right: this.props.keyboard.right,
            select: this.props.keyboard.select,
            start: this.props.keyboard.start,
            A: this.props.keyboard.A,
            B: this.props.keyboard.B,
            X: this.props.keyboard.X,
            Y: this.props.keyboard.Y,
          });
        }}>游戏设置</button>
        {this.state.hidden?<div/>:
        <div className='WindowMask'>
          <div className='Window'>
            <div className='header'>
              设置
              <button className='exit' onClick={()=>this.setState({hidden: true})}>X</button>
            </div>
            <div className='bodyBox' id='bodyBox'>
              <div className='body' id='body'>
                <div className='item'>
                  <div className='title'>个人设置</div>
                  <span>昵称</span>
                  <input type='text' id='name' defaultValue={this.state.name} onBlur={this.checkName.bind(this)}/>
                  <div id='checkName' className='msg'></div>
                </div>
                <div className='item'>
                  <div className='title'>按键设置</div>
                  <span>上 </span><input className='value' id='up' type='text' value={this.state.up} onKeyUp={(e)=>{this.setState({up: e.keyCode});document.getElementById('down').focus()}}/><br />
                  <span>下 </span><input className='value' id='down' type='text' value={this.state.down} onKeyUp={(e)=>{this.setState({down: e.keyCode});document.getElementById('left').focus()}}/><br />
                  <span>左 </span><input className='value' id='left' type='text' value={this.state.left} onKeyUp={(e)=>{this.setState({left: e.keyCode});document.getElementById('right').focus()}}/><br />
                  <span>右 </span><input className='value' id='right' type='text' value={this.state.right} onKeyUp={(e)=>{this.setState({right: e.keyCode});document.getElementById('select').focus()}}/><br />
                  <span>选择</span><input className='value' id='select' type='text' value={this.state.select} onKeyUp={(e)=>{this.setState({select: e.keyCode});document.getElementById('start').focus()}}/><br />
                  <span>确认</span><input className='value' id='start' type='text' value={this.state.start} onKeyUp={(e)=>{this.setState({start: e.keyCode});document.getElementById('A').focus()}}/><br />
                  <span>A </span><input className='value' id='A' type='text' value={this.state.A} onKeyUp={(e)=>{this.setState({A: e.keyCode});document.getElementById('B').focus()}}/><br />
                  <span>B </span><input className='value' id='B' type='text' value={this.state.B} onKeyUp={(e)=>{this.setState({B: e.keyCode});document.getElementById('X').focus()}}/><br />
                  <span>X </span><input className='value' id='X' type='text' value={this.state.X} onKeyUp={(e)=>{this.setState({X: e.keyCode});document.getElementById('Y').focus()}}/><br />
                  <span>Y </span><input className='value' id='Y' type='text' value={this.state.Y} onKeyUp={(e)=>{this.setState({Y: e.keyCode});document.getElementById('up').focus()}}/><br />
                </div>
              </div>
              <Scroll
                mainBoxID='bodyBox'
                contentID='body'
              />
            </div>
            <div className='footer'>
              <button className='close' onClick={()=>this.setState({hidden: true})}>关闭</button>
              <button className='save' id='save' onClick={()=>this.settingUpdate()}>保存</button>
              <div id='saveCheck' className='msg'></div>
            </div>
          </div>
        </div>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    keyboard: state.keyboard,
    user: state.user,
  }
}

export default connect(mapStateToProps, {roomSet, tabSet})(Setting);