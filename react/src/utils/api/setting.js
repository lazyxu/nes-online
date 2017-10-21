import ajax from './ajax.js';
import config from '../config';
import store from '../../store.js'
import actions from '../../actions/index.js'

exports.settingUpdate = (name, keyboard, callback) => {
  var url = config.apiServer+'/settingUpdate';
  var query = 'keyboard=' + JSON.stringify(keyboard)+'&oldName='+store.getState().user.name+'&name='+name;
  ajax.Post(url, query).then((data) => {
    if (data.state) {
      store.dispatch({
        type: "keyboardSet",
        keyboard: data.keyboard,
      });
      store.dispatch({
        type: "userUpdate",
        key: 'name',
        value: data.name,
      });
    }
    callback(data);
  }).catch((error) => {
    console.error(error);
  });
}