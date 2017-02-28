import React from 'react'

import './main.scss'
import ws from '../../utils/websocket.js'
import Scroll from '../../components/Scroll.jsx'

export default class UserTab extends React.Component {

  constructor(props) {
    super(props);
    this._wheelData = 0;
    this.state = {
      users: new Object(),
      hidden: false,
    };
  }

  componentDidMount() {
    this.setState({hidden: true});
    ws.on('userlist', (data) => {
      if (data.users==null) {
        this.setState({users: new Object()});
      } else {
        this.setState({users: data.users});
      }
    })
    ws.on('in', (data) => {
      this.state.users[data.user.name] = data.user;
      this.setState({users: this.state.users});
    })
    ws.on('out', (data) => {
      delete this.state.users[data.userName];
      this.setState({users: this.state.users});
    })
  }

  render() {
    var list=[];
    for (var name in this.state.users) {
      list.push(
        <div className='Block' key={name}>
          <img src={this.state.users[name].avatar}/>
          <div className='Info'>
            {this.state.users[name].name}
          </div>
        </div>
      )
    }
    
    return (
      <div>
        <button className='friends' onClick={()=>{this.setState({hidden: !this.state.hidden})}}>
          {list.length}
        </button>
        <div className='UserTab' id='UserTab' hidden={this.state.hidden}>
          <div className='UserListBox' id='UserListBox' >
            <div className='UserList' id='UserList' >
              <div className='tab'>
                ▼ 在线用户 ({list.length})
              </div>
              {list}
            </div>
            <Scroll 
              mainBoxID='UserListBox' 
              contentID='UserList'
              scrollUpdate={list.length}
            />
          </div>
        </div>
      </div>
    );
  }
}
