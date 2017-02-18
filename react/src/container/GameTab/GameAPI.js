var nes = null;
exports.addKeyboard = (nes, div) => {
    div.addEventListener('keydown', function(evt) {
        nes.keyboard.keyDown(evt); 
    });
    div.addEventListener('keyup', function(evt) {
        nes.keyboard.keyUp(evt); 
    });
    div.addEventListener('keypress', function(evt) {
        nes.keyboard.keyPress(evt); 
    });
}
exports.createUI = () => {
    window.nes = new JSNES({
        'ui': $('#emulator').JSNESUI()
    });
}
exports.loadRom = (nes, url) => {
    $.ajax({
        url: url,
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhr.overrideMimeType !== 'undefined') {
                // Download as binary
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            return xhr;
        },
        complete: function(xhr, status) {
            var i, data;
            if (JSNES.Utils.isIE()) {
                var charCodes = JSNESBinaryToArray(
                        xhr.responseBody
                ).toArray();
                data = String.fromCharCode.apply(
                        undefined,
                        charCodes
                );
            }
            else {
                data = xhr.responseText;
            }
            nes.loadRom(data);
            nes.start();
        }
    });
}

exports.pasue = () => {
    if (nes.isRunning) {
        nes.stop();
    }
    else {
        nes.start();
    }
}
exports.isRunning = () => {
    return nes.isRunning
}
exports.initSize = (nes) => {
    var height = document.documentElement.clientHeight-30;
    var width = document.documentElement.clientWidth;
    var emulator = document.getElementById("emulator");
    var landscape = ( height / 240 * 256 > width) ? false : true;
    if (!landscape) {
      nes.ui.screen.animate({width: width + 'px', height: ( width / 256 * 240) + "px"});
    } else {
      nes.ui.screen.animate({width: ( height / 240 * 256) + "px", height: height + "px"});
    }
  }

exports.reset = () => {
    nes.reset();
}

exports.restart = () => {
    nes.reloadRom();
    nes.start();
}

exports.sound = () => {
    if (nes.opts.emulateSound) {
        nes.opts.emulateSound = false;
    }
    else {
        nes.opts.emulateSound = true;
    }
}