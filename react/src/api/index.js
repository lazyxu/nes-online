import ajax from '../utils/ajax';
import config from './config';


exports.listUser = (callback) => {
  var url = config.apiServer+'/listUser';
  ajax.Get(url).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
}

exports.listGame = (callback) => {
  var url = config.apiServer+'/listGame';
  ajax.Get(url).then((data) => {
    callback(data);
  }).catch((error) => {
    console.error(error);
  });
}

exports.listRoom = (callback) => {
  var url = config.apiServer+'/listRoom';
  ajax.Get(url).then((rooms) => {
    console.log("rooms:");
    console.log(rooms);
    callback(rooms);
  }).catch((error) => {
    console.error(error);
  });
}