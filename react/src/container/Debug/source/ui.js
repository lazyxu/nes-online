/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

JSNES.UI = function (nes, canvas_id) {
    this.nes = nes;
    this.status = "";
    // this.width = 256;
    // this.height = 240;
    this.dynamicaudio = new DynamicAudio();
    this.canvasContext = document.getElementById(canvas_id).getContext("2d");
    document.addEventListener('keydown', function (evt) {
        self.nes.keyboard.keyDown(evt);
    });
    document.addEventListener('keyup', function (evt) {
        self.nes.keyboard.keyUp(evt);
    });
    document.addEventListener('keypress', function (evt) {
        self.nes.keyboard.keyPress(evt);
    });
    // Get the canvas buffer in 8bit and 32bit
    this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
    this.buf = new ArrayBuffer(this.canvasImageData.data.length);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Fill the canvas with black
    this.canvasContext.fillStyle = 'black';
    // set alpha to opaque
    this.canvasContext.fillRect(0, 0, 256, 240);

    this.reset();
    this.loadROM(this.nes.opts.nes_url);
};

JSNES.UI.prototype = {
    reset: function () {
        for (var i = 0; i < this.buf32.length; ++i) {
            this.buf32[i] = 0xFF000000;
        }
    },

    loadROM: function (url) {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.open('GET', url);
        xhr.send(null);
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    self.nes.loadRom(xhr.responseText);
                    self.nes.start();
                } else {
                    console.log(xhr.status, xhr.responseText);
                }
            }
        });
        xhr.addEventListener('error', (error) => {
            console.log(error);
        });
    },

    updateStatus: function (s) {
        this.status = s;
    },

    writeAudio: function (samples) {
        return this.dynamicaudio.writeInt(samples);
    },

    writeFrame: function (buffer) {
        for (var y = 0 + 8; y < 240 - 8; ++y) {
            for (var x = 0 + 8; x < 256 - 8; ++x) {
                i = y * 256 + x;
                // Convert pixel from NES BGR to canvas ABGR
                this.buf32[i] = 0xff000000 | this.nes.ppu.getColor(buffer[i]); // Full alpha
            }
        }

        // for (var i = 0; i < buffer.length; i++) {
        //     this.buf32[i] = 0xFF000000 | this.nes.ppu.getColor(buffer[i]);
        // }
        this.canvasImageData.data.set(this.buf8);
        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }
}
