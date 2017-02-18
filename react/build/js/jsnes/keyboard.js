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
    var i;
    
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
    this.player1 = {
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
    };
    this.player2 = {
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
    };
    this.state1 = new Array(8);
    for (i = 0; i < this.state1.length; i++) {
        this.state1[i] = 0x40;
    }
    this.state2 = new Array(8);
    for (i = 0; i < this.state2.length; i++) {
        this.state2[i] = 0x40;
    }
};

JSNES.Keyboard.prototype = {
    setKey: function(key, value) {
        switch (key) {
            case this.player1.A: this.state1[this.keys.A] = value; break;      // X
            case this.player1.B: this.state1[this.keys.B] = value; break;      // Z
            case this.player1.select: this.state1[this.keys.select] = value; break; // Right Ctrl
            case this.player1.start: this.state1[this.keys.start] = value; break;  // Enter
            case this.player1.up: this.state1[this.keys.up] = value; break;     // Up
            case this.player1.down: this.state1[this.keys.down] = value; break;   // Down
            case this.player1.left: this.state1[this.keys.left] = value; break;   // Left
            case this.player1.right: this.state1[this.keys.right] = value; break;  // Right

            case this.player2.A: this.state2[this.keys.A] = value; break;     // Num-7
            case this.player2.B: this.state2[this.keys.B] = value; break;     // Num-9
            case this.player2.select: this.state2[this.keys.select] = value; break; // Num-3
            case this.player2.start: this.state2[this.keys.start] = value; break;  // Num-1
            case this.player2.up: this.state2[this.keys.up] = value; break;    // Num-8
            case this.player2.down: this.state2[this.keys.down] = value; break;   // Num-2
            case this.player2.left: this.state2[this.keys.left] = value; break;  // Num-4
            case this.player2.right: this.state2[this.keys.right] = value; break; // Num-6
            default: return true;
        }
        return false; // preventDefault
    },

    keyDown: function(evt) {
        if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault) {
            evt.preventDefault();
        }
    },
    
    keyUp: function(evt) {
        if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault) {
            evt.preventDefault();
        }
    },
    
    keyPress: function(evt) {
        evt.preventDefault();
    }
};
