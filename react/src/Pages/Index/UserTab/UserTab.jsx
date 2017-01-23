import './main.scss';
import React from 'react';
import UserList from './UserList/UserList';
export default class UserTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {tab: 0};
  }

  render() {
    return (
      <div className='UserTab'>
        <div className='Tab' >
          <button className={this.state.tab==0?'Show':'Hide'} onClick={() => this.setState({tab: 0})}>在线用户</button>
          <button className={this.state.tab==1?'Show':'Hide'} onClick={() => this.setState({tab: 1})}>好友</button>
        </div>
        {this.state.tab==0?<UserList />:<div className='List'/>}
      </div>
    );
  }
}
