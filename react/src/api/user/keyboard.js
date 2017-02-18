import ajax from '../../utils/ajax';
import config from '../config';
import store from '../../store.js'

exports.load = (callback) => {
  var url = config.apiServer+'/getKeyboard?name='+store.getState().user.name;
  ajax.Get(url).then((keyboard) => {
    store.dispatch({
      type: "keyboardSet",
      keyboard: keyboard
    });
    window.nes.keyboard.player1 = keyboard;
    callback(keyboard);
  }).catch((error) => {
    console.error(error);
  });
}

exports.update = (keyboard, callback) => {
  var url = config.apiServer+'/setKeyboard?name='+store.getState().user.name;
  var query = 'keyboard=' + JSON.stringify(keyboard);
  ajax.Post(url, query).then((data) => {
    store.dispatch({
      type: "keyboardSet",
      keyboard: keyboard
    });
    window.nes.keyboard.player1 = keyboard;
    callback(data);
  }).catch((error) => {
    console.error(error);
  });
}

exports.get = () => {
  return {
    
  }
}