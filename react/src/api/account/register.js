import ajax from '../../utils/ajax';
import config from './config';

exports.checkMail = (mail, callback) => {
  var url = config.apiServer+'/checkMail?mail=' + mail;
  ajax.Get(url).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
} 

exports.checkName = (name, callback) => {
  var url = config.apiServer+'/checkName?name=' + name;
  ajax.Get(url).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
} 

exports.register = (mail, name, password, callback) => {
  var url = config.apiServer+'/register';
  var query = 'mail=' + mail + '&name=' + name + '&password=' + password;
  ajax.Post(url, query).then((data) => {
    callback(data)
  }).catch((error) => {
    console.error(error);
  });
} 