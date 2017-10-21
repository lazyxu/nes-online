import ajax from './ajax.js'
import store from '../store.js'

exports.get = (callback) => {
  return new Promise(resolve => {
    var url = '/api/getKeyboard'
    ajax.Get(url).then(resp => {
      resolve(JSON.parse(resp))
    }).catch(err => {
      console.error(err)
    })
  })
}

exports.update = (keyboard, callback) => {
    return new Promise(resolve => {
        var url = '/api/updateKeyboard'
        var query = 'keyboard=' + JSON.stringify(keyboard);
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}