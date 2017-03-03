import React from 'react'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'

import './main.scss'
import utils from './utils'
import api from '../../api/user/active.js'

export default class Active extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var id = 'active';
    utils.msgInfo(id, '正在激活账户...');
    api.active(this.props.params.active_code, (data) => {
      setTimeout(function() {
        location.href="/";
      }, 3000);
      if (!data.state) {
        utils.msgERR(id, data.msg+'3s后跳转到登录界面');
        return
      }
      utils.msgOK(id, data.msg+'3s后跳转到登录界面');
    });
  }
  
  render() {
    return (
      <div className='Form'>
        {/*<img src="/img/background.jpg" className='Background'/>*/}
        <h1>激活账户</h1>
        <div className='msg' id='active'></div>
      </div>
    )
  }
}
