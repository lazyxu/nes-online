import ajax from '../../utils/ajax';
import config from './config';

exports.active = (active_code, callback) => {
  var url = config.apiServer+'/active'
  var query = 'active_code=' + active_code;
  ajax.Post(url, query).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
}