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

JSNES.DummyUI = function(nes) {
    this.nes = nes;
    this.enable = function() {};
    this.updateStatus = function() {};
    this.writeAudio = function() {};
    this.writeFrame = function() {};
};

if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.JSNESUI = function() {
            var parent = this;
            var UI = function(nes) {
                var self = this;
                self.nes = nes;
                
                /*
                 * Create UI
                 */
                self.screen = $('<canvas id="canvas" class="nes-screen" width="256" height="240"></canvas>').appendTo(parent);
                
                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                
                // self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.root);
                if (this.nes.opts.statusID=="")
                    self.status = $('<p class="nes-status" hidden>Booting up...</p>').appendTo(parent);
                else 
                    self.status = document.getElementById(this.nes.opts.statusID);
                console.log(self.status)
                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');
                
                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                
                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();
                
                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath+'dynamicaudio.swf'
                });
            };
        
            UI.prototype = {
                addKeyboard: function(div) {
                    var self = this;
                    div.addEventListener('keydown', function(evt) {
                        self.nes.keyboard.keyDown(evt); 
                    });
                    div.addEventListener('keyup', function(evt) {
                        self.nes.keyboard.keyUp(evt); 
                    });
                    div.addEventListener('keypress', function(evt) {
                        self.nes.keyboard.keyPress(evt); 
                    });
                },

                resize: function() {
                    var self = this;
                    var height = document.documentElement.clientHeight-30;
                    var width = document.documentElement.clientWidth;
                    var emulator = document.getElementById("emulator");
                    var landscape = ( height / 240 * 256 > width) ? false : true;
                    if (!landscape) {
                        self.screen.animate({width: width + 'px', height: ( width / 256 * 240) + "px"});
                    } else {
                        self.screen.animate({width: ( height / 240 * 256) + "px", height: height + "px"});
                    }
                },

                loadROM: function(url) {
                    var self = this;
                    $.ajax({
                        url: url,
                        xhr: function() {
                            var xhr = $.ajaxSettings.xhr();
                            if (typeof xhr.overrideMimeType !== 'undefined') {
                                // Download as binary
                                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                            }
                            self.xhr = xhr;
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
                            self.nes.loadRom(data);
                            self.nes.start();
                        }
                    });
                },
                
                resetCanvas: function() {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },
                
                emulateSoundChange: function() {
                    if (this.nes.opts.emulateSound) {
                        this.nes.opts.emulateSound = false;
                    }
                    else {
                        this.nes.opts.emulateSound = true;
                    }
                },
                stopOrStart: function() {
                    if (this.nes.isRunning) {
                        this.nes.stop();
                    }
                    else {
                        this.nes.start();
                    }
                },
            
                updateStatus: function(s) {
                    this.status.innerHTML = s;
                },
            
                writeAudio: function(samples) {
                    return this.dynamicaudio.writeInt(samples);
                },
            
                writeFrame: function(buffer, prevBuffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;

                    for (i=0; i<256*240; i++) {
                        pixel = buffer[i];

                        if (pixel != prevBuffer[i]) {
                            j = i*4;
                            imageData[j] = pixel & 0xFF;
                            imageData[j+1] = (pixel >> 8) & 0xFF;
                            imageData[j+2] = (pixel >> 16) & 0xFF;
                            prevBuffer[i] = pixel;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };
        
            return UI;
        };
    })(jQuery);
}
