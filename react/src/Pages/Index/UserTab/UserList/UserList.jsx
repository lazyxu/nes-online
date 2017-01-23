import './main.scss';
import React from 'react';
import Ajax from '../../../../Utils/Ajax';
import Server from '../../../../Config/Server';

export default class UserList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"loaded":false, "list": []};
  }

  componentDidMount() {
    let url = Server.domain+'/api/UserList';
    Ajax.Get(url).then((data) => {
      console.log(data);
      this.setState({"loaded": true, "list": data});
    }).catch((error) => {
      console.error(error);
    });
  }

  render() {
    if (!this.state.loaded) {
      return (
        <div className="UserList">
          正在加载在线玩家...
        </div>
      );
    } else {
      return (
        <div className="UserList">
          {this.state.list.map(user=>{
            return (
              <div className="Block" key={user.name}>
                  <div className="Info">
                    {user.name}
                  </div>
              </div>
            )
          })}
        </div>
      );
    }
  }
}
