import ajax from './ajax.js'
import Base64 from './Base64.js'

var base64 = new Base64()

exports.uploadROM = (rom, screenShot) => {
  return new Promise(resolve => {
    var url = '/api/uploadROM'

    // FormData 对象
    var form = new FormData();
    form.append("screenShot", screenShot);
    form.append("rom", rom);
    // XMLHttpRequest 对象
    var xhr = new XMLHttpRequest();
    xhr.open("post", url, true);
    xhr.send(form);

    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(e);
        }
      }
    });
    xhr.addEventListener('error', function (error) {
      reject(error);
    });
  })
}
