import ajax from '../../utils/ajax';
import config from '../config'
import store from '../../store.js'

exports.getGameList = (callback) => {
  var url = config.apiServer+'/getGameList';
  ajax.Get(url).then((gameList) => {
    callback(gameList);
  }).catch((error) => {
    console.error(error);
  });
}