import ajax from '../../utils/ajax';
import config from '../config';

exports.forgetPassword = (mail, callback) => {
  var url = config.apiServer+'/forgetPassword'
  var query = 'mail=' + mail;
  ajax.Post(url, query).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
}