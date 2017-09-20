import React from 'react'
import { connect } from 'react-redux'

import './GameList.scss'
import api from '../../api/game/index.js'
import Scroll from '../../components/Scroll.jsx'
import {gameSet, tabSet} from '../../actions/actions'

class GameList extends React.Component {

  constructor(props) {
    super(props);
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
          {this.props.gamelist.map(game=>{
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
          scrollUpdate={this.props.gamelist.length}
        />
      </div>
    );
  }
}
function mapStateToProps(state) {
    return {
      gamelist: state.gamelist,
    }
}
export default connect(mapStateToProps, {gameSet, tabSet})(GameList);