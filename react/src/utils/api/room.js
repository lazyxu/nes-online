import ajax from './ajax.js'

exports.createRoom = (game) => {
  return new Promise(resolve => {
    var url = '/api/createRoom?game=' + game
    ajax.Get(url).then((resp) => {
      resolve(JSON.parse(resp))
    }).catch((error) => {
      console.error(error)
    });
  })
}