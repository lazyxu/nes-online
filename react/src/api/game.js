import ajax from './ajax.js'

exports.getGameList = () => {
  return new Promise(resolve => {
    var url = '/api/getGameList'
    ajax.Get(url).then(resp => {
      resolve(JSON.parse(resp))
    }).catch(err => {
      console.error(err)
    })
  })
}