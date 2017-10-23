import ajax from './ajax.js'
import Base64 from './Base64.js'

var base64 = new Base64()

exports.uploadROM = (name, rom, screenShot) => {
  return new Promise(resolve => {
    var url = '/api/uploadROM'
    var query = 'name=' + name+'&rom='+ base64.encode(rom)+'&screenShot='+base64.encode(screenShot)
    ajax.Post(url, query).then((resp) => {
    //   resolve(JSON.parse(resp))
    }).catch((error) => {
      console.error(error)
    })
  })
}
