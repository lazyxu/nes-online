import React from 'react'
import { connect } from 'react-redux'

import './main.scss'
import api from '../../../api/game/index.js'
import Scroll from '../../../components/Scroll.jsx'

export default class GameList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      "games": [],
      scrollUpdate: 0,
    };
  }

  componentDidMount() {
    api.listGame((games) => {
      if (games==null) {
        this.setState({games: []});
      } else {
        this.setState({games: games});
      }
      this.setState({scrollUpdate: this.state.scrollUpdate+1});
      // new addScroll('GameList-Box','GameList','GameList-scrollDiv');
    });
  }

  chooseGame(game) {
    console.log("选择游戏 "+game);
    this.props.setGame(game);
    this.props.setGameTab("GamePreview");
    return false;
  }

  render() {
    return (
      <div className='GameListBox' id='GameListBox'>
        <div className="GameList" id='GameList'>
          {this.state.games.map(game=>{
            return (
              <div className="Block" id='Block' key={game.name} onClick={this.chooseGame.bind(this, game.name)}>
                <img src={'/rom/'+game.name+'.jpg'}/>
                <div className="Info">
                  {game.name}
                </div>
              </div>
            )
          })}
        </div>
        <Scroll 
          mainBoxID='GameListBox' 
          contentID='GameList' 
          scrollID='scrollDivGameList'
          scrollBackgroundStyle='defaultScrollBackground' 
          scrollStyle='defaultScroll'
          scrollUpdate={this.state.scrollUpdate}
        />
      </div>
    );
  }
}