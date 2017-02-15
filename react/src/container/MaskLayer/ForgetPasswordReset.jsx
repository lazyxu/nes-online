import React from 'react'
import { Link } from 'react-router'

import './main.scss'
import utils from './utils'
import api from '../../api/account/forgetPassword'

export default class ForgetPasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.checkPassword = this.checkPassword.bind(this);
    this.forgetPasswordReset = this.forgetPasswordReset.bind(this);
  }

  forgetPasswordReset() {
    var mail = document.getElementsByName('mail')[0].value;
    api.forgetPasswordReset(mail, (data) => {
      var id = 'check';
      if (!data.state) {
        utils.msgERR(id, data.msg);
        return
      }
      utils.msgOK(id, data.msg);
    });
  }

  checkPassword() {
    var password = document.getElementsByName('password')[0].value;
    var rePassword = document.getElementsByName('password')[1].value;
    var id = 'checkPassword';
    if (password=="") {
      utils.msgERR(id, '请输入密码');
      this.setState({checkPassword: false});
      document.getElementById('reset').className = 'disableButton';
      return
    }
    if (password!=rePassword) {
      utils.msgERR(id, '两次输入的密码不一致');
      this.setState({checkPassword: false});
      document.getElementById('reset').className = 'disableButton';
      return
    }
    utils.msgOK(id, '');
    this.setState({checkPassword: true});
    if (this.state.checkMail && this.state.checkName) 
      document.getElementById('reset').className = 'enableButton';
    else
      document.getElementById('reset').className = 'disableButton';
  }

  render() {
    return (
      <div className='MaskLayer'>
        <div className='Form'>
          <h1>重置密码</h1>
          <input type='password' placeholder='密码' name='password' onBlur={this.checkPassword}/>
          <input type='password' placeholder='再次输入密码' name='password' onBlur={this.checkPassword}/>
          <div id='checkPassword' className='msg'></div>
          <div className='link'>
            <Link to="/login" className='leftLink'>想起密码了？登录吧</Link>
          </div>
          <button type='button' className='enableButton' id="reset" onClick={this.forgetPasswordReset}>确认</button>
          <div id='check' className='msg'></div>
        </div>
      </div>
    )
  }
}