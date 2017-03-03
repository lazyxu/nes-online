import React from 'react'
import { Link } from 'react-router'

import './main.scss'
import utils from './utils'
import api from '../../api/user/register'

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.checkMail = this.checkMail.bind(this);
    this.checkName = this.checkName.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.register = this.register.bind(this);
    this.state = {
      checkMail: false,
      checkName: false,
      checkPassword: false,
    }
  }

  checkMail() {
    var mail = document.getElementsByName('mail')[0].value;
    var id = 'checkMail';
    if (mail=="") {
      utils.msgERR(id, '请填写你的邮箱地址');
      this.setState({checkMail: false});
      document.getElementById('register').className = 'disableButton';
      return
    }
    var myreg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if (!myreg.test(mail)) {
      utils.msgERR(id, '请填写有效的邮箱地址');
      this.setState({checkMail: false});
        document.getElementById('register').className = 'disableButton';
      return
    }
    api.checkMail(mail, (data) => {
      if (!data.state) {
        utils.msgERR(id, data.msg);
        this.setState({checkMail: false});
        document.getElementById('register').className = 'disableButton';
        return
      }
      utils.msgOK(id, data.msg);
      this.setState({checkMail: true});
      if (this.state.checkName && this.state.checkPassword) 
        document.getElementById('register').className = 'enableButton';
      else
        document.getElementById('register').className = 'disableButton';
    });
  }

  checkName() {
    var name = document.getElementsByName('name')[0].value;
    var id = 'checkName';
    if (name=="") {
      utils.msgERR(id, '请填写你的昵称');
        this.setState({checkName: false});
        document.getElementById('register').className = 'disableButton';
      return
    }
    if (name.indexOf('@')>0) {
      utils.msgERR(id, '用户名中不允许包含@');
        this.setState({checkName: false});
        document.getElementById('register').className = 'disableButton';
      return
    }
    api.checkName(name, (data) => {
      if (!data.state) {
        utils.msgERR(id, data.msg);
        this.setState({checkName: false});
        document.getElementById('register').className = 'disableButton';
        return
      }
      utils.msgOK(id, data.msg);
      this.setState({checkName: true});
      if (this.state.checkMail && this.state.checkPassword) 
        document.getElementById('register').className = 'enableButton';
      else
        document.getElementById('register').className = 'disableButton';
    });
  }

  checkPassword() {
    var password = document.getElementsByName('password')[0].value;
    var rePassword = document.getElementsByName('password')[1].value;
    var id = 'checkPassword';
    if (password=="") {
      utils.msgERR(id, '请输入密码');
      this.setState({checkPassword: false});
      document.getElementById('register').className = 'disableButton';
      return
    }
    if (password!=rePassword) {
      utils.msgERR(id, '两次输入的密码不一致');
      this.setState({checkPassword: false});
      document.getElementById('register').className = 'disableButton';
      return
    }
    utils.msgOK(id, '');
    this.setState({checkPassword: true});
    if (this.state.checkMail && this.state.checkName) 
      document.getElementById('register').className = 'enableButton';
    else
      document.getElementById('register').className = 'disableButton';
  }

  register() {
    var mail = document.getElementsByName('mail')[0].value;
    var name = document.getElementsByName('name')[0].value;
    var password = document.getElementsByName('password')[0].value;
    if (this.state.checkMail && this.state.checkName && this.state.checkPassword) {
      var id = 'checkRegister';
      api.register(mail, name, password, (data) => {
        if (!data.state) {
          utils.msgERR(id, data.msg);
          return
        }
        utils.msgOK(id, data.msg);
      });
    }
  }

  render() {
    return (
      <div className='Form'>
        {/*<img src="/img/background.jpg" className='Background'/>*/}
        <h1>注册</h1>
        <input type='email' placeholder='邮箱' name='mail' onBlur={this.checkMail}/>
        <div id='checkMail' className='msg'></div>
        <input type='text' placeholder='用户名' name='name' onBlur={this.checkName}/>
        <div id='checkName' className='msg'></div>
        <input type='password' placeholder='密码' name='password' onBlur={this.checkPassword}/>
        <input type='password' placeholder='再次输入密码' name='password' onBlur={this.checkPassword}/>
        <div id='checkPassword' className='msg'></div>
        <div className='link'>
          <Link to="/login" className='rightLink'>已有帐号？登录</Link>
        </div>
        <button type='button' id='register' className='disableButton' onClick={this.register}>发送注册邮件</button>
        <div id='checkRegister' className='msg'></div>
      </div>
    )
  }
}
