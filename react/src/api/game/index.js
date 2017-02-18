import ajax from '../../utils/ajax';
import config from '../config'
import store from '../../store.js'

exports.listGame = (callback) => {
  var url = config.apiServer+'/listGame';
  ajax.Get(url).then((games) => {
    console.log("gamelist");
    console.log(games);
    callback(games);
  }).catch((error) => {
    console.error(error);
  });
}