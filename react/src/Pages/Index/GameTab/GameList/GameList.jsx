import './main.scss';
import React from 'react';
import Ajax from '../../../../Utils/Ajax';
import Server from '../../../../Config/Server';

export default class GameList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"loaded":false, "list": []};
  }

  componentDidMount() {
    let url = Server.domain+'/api/GameList';
    Ajax.Get(url).then((data) => {
      this.setState({"loaded": true, "list": data});
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
