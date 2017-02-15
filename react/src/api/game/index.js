import ajax from '../../utils/ajax';
import config from './config';


exports.listGame = (callback) => {
  var url = config.apiServer+'/listGame';
  ajax.Get(url).then((games) => {
    console.log("games:");
    console.log(games);
    callback(games);
  }).catch((error) => {
    console.error(error);
  });
}