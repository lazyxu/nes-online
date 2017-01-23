import './main.scss';
import React from 'react';
import get from '../../../utils/ajax';
import server from '../../../config/server';
// import ws from '../../../utils/websocket';

export default class GameList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"loaded":false, "list": []};
  }

  componentDidMount() {
    let url = server.domain+'/api/GameList';
    get(url).then((data) => {
      this.setState({"loaded": true, "list": data});
      // ws.sendWS({
      //   "Handle": "Msg",
      //   "Msg": "gamelist"
      // })
    }).catch((error) => {
      console.error(error);
    });
  }

  render() {
    if (!this.state.loaded) {
      return (
        <div className="GameList">
          正在加载游戏库...
        </div>
      );
    } else {
      return (
        <div className="GameList">
          {this.state.list.map(game=>{
            return (
              <div className="Block" key={game.name}>
                <img src={game.shortcut}/>
                <div className="Info">
                  {game.name}<br/>
                  评分: {game.stars.average}<br/>
                  收藏: {game.collections}<br/>
                </div>
              </div>
            )
          })}
        </div>
      );
    }
  }
}
