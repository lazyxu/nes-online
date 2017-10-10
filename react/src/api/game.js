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

exports.getRom = (rom) => {
  return new Promise(resolve => {
    var url = '/roms/'+rom+'.nes'
    ajax.Get(url).then(resp => {
      resolve(resp)
    }).catch(err => {
      console.error(err)
    })
  })
}