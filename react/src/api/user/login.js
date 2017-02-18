import ajax from '../../utils/ajax';
import config from '../config';

exports.login = (account, password, callback) => {
  var url = config.apiServer+'/login';
  var query = 'account=' + account + '&password=' + password ;
  ajax.Post(url, query).then((data) => {
    callback(data);
  }).catch((error) => {
    console.error(error);
  });
}

exports.loginCheck = (callback) => {
  var url = config.apiServer+'/loginCheck';
  ajax.Post(url).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
}
