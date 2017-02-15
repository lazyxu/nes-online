import React from 'react'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'

import './main.scss'
import utils from './utils'
import api from '../../api/account/active.js'

export default class Active extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var id = 'active';
    utils.msgInfo(id, '正在激活账户...');
    api.active(this.props.params.active_code, (data) => {
      if (!data.state) {
        utils.msgERR(id, data.msg);
        return
      }
      utils.msgOK(id, data.msg);
      browserHistory.push("/#/login");
    });
  }
  
  render() {
    return (
      <div className='MaskLayer'>
        <div className='Form'>
          <h1>激活账户</h1>
          <div className='msg' id='active'></div>
        </div>
      </div>
    )
  }
}
