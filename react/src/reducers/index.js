import { combineReducers } from 'redux'
import game from './game.js'
import tab from './tab.js'
import gameTab from './gameTab'
import room from './room.js'
import roomlist from './roomlist.js'
import user from './user.js'
import msg from './msg.js'
import nes from './nes.js'
import keyboard from './keyboard.js'
import gamelist from './gamelist.js'

export default combineReducers({
  game,
  tab,
  gameTab,
  room,
  roomlist,
  user,
  msg,
  nes,
  keyboard,
  gamelist,
})