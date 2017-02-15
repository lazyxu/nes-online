var nes = null;
exports.createUI = () => {
    nes = new JSNES({
        'ui': $('#emulator').JSNESUI()
    });
}
exports.loadRom = (url) => {
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

exports.pasue = (nes) => {
    if (nes.isRunning) {
        nes.stop();
    }
    else {
        nes.start();
    }
}

exports.restart = (nes) => {
    nes.reloadRom();
    nes.start();
}

exports.sound = (nes) => {
    if (nes.opts.emulateSound) {
        nes.opts.emulateSound = false;
    }
    else {
        nes.opts.emulateSound = true;
    }
}