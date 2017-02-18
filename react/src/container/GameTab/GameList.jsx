import React from 'react'
import { connect } from 'react-redux'

import './GameList.scss'
import api from '../../api/game/index.js'
import Scroll from '../../components/Scroll.jsx'
import {gameSet, tabSet} from '../../actions/actions'

class GameList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      games: [],
    };
  }

  componentDidMount() {
    api.listGame( games => {
      if (games==null) {
        this.setState({games: []});
      } else {
        this.setState({games: games});
      }
    });
  }

  chooseGame(game) {
    console.log("选择游戏 "+game);
    this.props.gameSet(game);
    this.props.tabSet("GamePreview");
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
          scrollUpdate={this.state.games.length}
        />
      </div>
    );
  }
}

export default connect(null, {gameSet, tabSet})(GameList);