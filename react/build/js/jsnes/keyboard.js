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

// Keyboard events are bound in the UI
JSNES.Keyboard = function() {
    this.keys = {
        A: 0,
        B: 1,
        select: 2,
        start: 3,
        up: 4,
        down: 5,
        left: 6,
        right: 7
    };
    this.player = [{
        A: 74,
        B: 75,
        X: 85,
        Y: 73,
        select: 86,
        start: 66,
        up: 87,
        down: 83,
        left: 65,
        right: 68
    },
    {
        A: 50,
        B: 51,
        X: 53,
        Y: 54,
        select: 49,
        start: 52,
        up: 38,
        down: 40,
        left: 37,
        right: 39
    }];
    this.interval = [{
        X: null,
        Y: null,
    },
    {
        X: null,
        Y: null,
    }];

    this.state = new Array(this.player.length);
    for (var i=0; i<this.player.length;i++) {
        this.state[i] = new Array(8);
        for (j = 0; j < 8; j++) {
            this.state[i][j] = 0x40;
        }
    }
};

JSNES.Keyboard.prototype = {
    setKey: function(i, key, value) {
        // if (value==0x41)
        //     console.log(key, value);
        switch (key) {
            case this.player[i].X:
                if (value==0x41) {
                    if (this.interval[i].X) {
                        clearInterval(this.interval[i].X);
                        this.interval[i].X = null;
                    }
                    this.interval[i].X = setInterval( () => {
                        if (this.state[i][this.keys.A]==0x40)
                            this.state[i][this.keys.A] = 0x41;
                        else if (this.state[i][this.keys.A]==0x41)
                            this.state[i][this.keys.A] = 0x40;
                    }, 50);
                }
                else if (value==0x40) {
                    clearInterval(this.interval[i].X);
                    this.interval[i].X = null;
                    this.state[i][this.keys.A] = 0x40;
                }
                break;
            case this.player[i].Y:
                if (value==0x41) {
                    if (this.interval[i].Y) {
                        clearInterval(this.interval[i].Y);
                        this.interval[i].Y = null;
                    }
                    this.interval[i].Y = setInterval( () => {
                        if (this.state[i][this.keys.B]==0x40)
                            this.state[i][this.keys.B] = 0x41;
                        else if (this.state[i][this.keys.B]==0x41)
                            this.state[i][this.keys.B] = 0x40;
                    }, 50);
                }
                else if (value==0x40) {
                    clearInterval(this.interval[i].Y);
                    this.interval[i].Y = null;
                    this.state[i][this.keys.B] = 0x40;
                }
                break;
            case this.player[i].A: this.state[i][this.keys.A] = value; break;
            case this.player[i].B: this.state[i][this.keys.B] = value; break;
            case this.player[i].select: this.state[i][this.keys.select] = value; break;
            case this.player[i].start: this.state[i][this.keys.start] = value; break;
            case this.player[i].up: this.state[i][this.keys.up] = value; break;
            case this.player[i].down: this.state[i][this.keys.down] = value; break;
            case this.player[i].left: this.state[i][this.keys.left] = value; break;
            case this.player[i].right: this.state[i][this.keys.right] = value; break;
            default: return true;
        }
        return false; // preventDefault
    },

    keyDown: function(evt) {
        window.nes.keyboardLog[window.nes.frameCount%window.nes.frameSend].push({
            'key': evt.keyCode,
            'value': 0x41,
        });
        // if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault) {
        //     evt.preventDefault();
        // }
        evt.preventDefault();
    },
    
    keyUp: function(evt) {
        window.nes.keyboardLog[window.nes.frameCount%window.nes.frameSend].push({
            'key': evt.keyCode,
            'value': 0x40,
        });
        // if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault) {
        //     evt.preventDefault();
        // }
        evt.preventDefault();
    },
    
    keyPress: function(evt) {
        evt.preventDefault();
    }
};
