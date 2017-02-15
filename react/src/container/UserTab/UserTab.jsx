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
      scrollUpdate: 0,
    };
  }

  componentDidMount() {
    ws.on('userlist', (data) => {
      if (data.users==null) {
        this.setState({users: new Object()});
      } else {
        this.setState({users: data.users});
      }
      this.setState({scrollUpdate: this.state.scrollUpdate+1});
    })
    ws.on('in', (data) => {
      this.state.users[data.user.name] = data.user;
      this.setState({users: this.state.users});
      this.setState({scrollUpdate: this.state.scrollUpdate+1});
    })
    ws.on('out', (data) => {
      delete this.state.users[data.userName];
      this.setState({users: this.state.users});
      this.setState({scrollUpdate: this.state.scrollUpdate+1});
    })
  }

  render() {
    var list=[];
    var count=0;
    for (var name in this.state.users) {
      count++;
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
          {count}
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
              scrollID='scrollDivUserList'
              scrollBackgroundStyle='defaultScrollBackground' 
              scrollStyle='defaultScroll'
              scrollUpdate={this.state.scrollUpdate}
            />
          </div>
        </div>
      </div>
    );
  }
}
