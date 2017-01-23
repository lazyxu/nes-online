import './main.scss'
import React from 'react'
import Ajax from '../../../../Utils/Ajax'
import Server from '../../../../Config/Server'
import { connect } from 'react-redux'
import actions from '../../../../actions/actions'

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(event) {
    var newState = {};
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  }

  handleClick() {
    let url = Server.domain+'/api/Login';
    var query = 'username=' + this.state.username + '&password=' + this.state.password ;
    console.log(query);
    Ajax.Post(url, query).then((data) => {
      console.log(data);
      if (data.login) {
        this.props.setMask("");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
        <div className='login-form'>
          <h1 className='Title'>登录</h1>
          <div className='form-group '>
            <input type='text' className='form-control' placeholder='用户名' name='username' onChange={this.handleChange}/>
            <i className='fa fa-user'></i>
          </div>
          <div className='form-group log-status'>
            <input type='password' className='form-control' placeholder='密码' name='password' onChange={this.handleChange}/>
            <i className='fa fa-lock'></i>
          </div>
            <span className='alert'>账号或密码错误</span>
            <a className='LeftLink' href='#'>&lt;-注册</a>
            <a className='RightLink' href='#'>忘记密码-&gt;</a>
          <button type='button' className='log-btn' onClick={this.handleClick}>登录</button>
          <br /><br />
          <img src="/img/github.png"/>
        </div>
    )
  }
}