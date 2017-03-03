import React from 'react'
import { Link } from 'react-router'

import './main.scss'
import utils from './utils'
import api from '../../api/user/forgetPassword'

export default class ForgetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.forgetPassword = this.forgetPassword.bind(this);
  }

  forgetPassword() {
    var mail = document.getElementsByName('mail')[0].value;
    api.forgetPassword(mail, (data) => {
      var id = 'check';
      if (!data.state) {
        utils.msgERR(id, data.msg);
        return
      }
      utils.msgOK(id, data.msg);
    });
  }

  render() {
    return (
      <div className='Form'>
        {/*<img src="/img/background.jpg" className='Background'/>*/}
        <h1>忘记密码</h1>
        <input type='text' placeholder='邮箱' name='mail' />
        <div className='link'>
          <Link to="/login" className='leftLink'>想起密码了？登录吧</Link>
        </div>
        <button type='button' className='enableButton' onClick={this.forgetPassword}>发送验证邮件</button>
        <div id='check' className='msg'></div>
      </div>
    )
  }
}