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
        KEY_A: 0,
        KEY_B: 1,
        KEY_SELECT: 2,
        KEY_START: 3,
        KEY_UP: 4,
        KEY_DOWN: 5,
        KEY_LEFT: 6,
        KEY_RIGHT: 7
    };

    this.key1Setting = {
        KEY_A: 75,
        KEY_B: 74,
        KEY_SELECT: 86,
        KEY_START: 66,
        KEY_UP: 87,
        KEY_DOWN: 83,
        KEY_LEFT: 65,
        KEY_RIGHT: 68
    };

    this.key2Setting = {
        KEY_A: 75,
        KEY_B: 74,
        KEY_SELECT: 86,
        KEY_START: 66,
        KEY_UP: 87,
        KEY_DOWN: 83,
        KEY_LEFT: 65,
        KEY_RIGHT: 68
    };

    // this.key2Setting = {
    //     KEY_A: 103,
    //     KEY_B: 105,
    //     KEY_SELECT: 99,
    //     KEY_START: 97,
    //     KEY_UP: 104,
    //     KEY_DOWN: 98,
    //     KEY_LEFT: 100,
    //     KEY_RIGHT: 102
    // };

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
        var ret = 0;
        switch (key) {
            case this.key1Setting.KEY_A: this.state1[this.keys.KEY_A] = value; break;      // X
            case this.key1Setting.KEY_B: this.state1[this.keys.KEY_B] = value; break;      // Z
            case this.key1Setting.KEY_SELECT: this.state1[this.keys.KEY_SELECT] = value; break; // Right Ctrl
            case this.key1Setting.KEY_START: this.state1[this.keys.KEY_START] = value; break;  // Enter
            case this.key1Setting.KEY_UP: this.state1[this.keys.KEY_UP] = value; break;     // Up
            case this.key1Setting.KEY_DOWN: this.state1[this.keys.KEY_DOWN] = value; break;   // Down
            case this.key1Setting.KEY_LEFT: this.state1[this.keys.KEY_LEFT] = value; break;   // Left
            case this.key1Setting.KEY_RIGHT: this.state1[this.keys.KEY_RIGHT] = value; break;  // Right
            default: ret++;
        }
        switch (key) {
            case this.key2Setting.KEY_A: this.state2[this.keys.KEY_A] = value; break;     // Num-7
            case this.key2Setting.KEY_B: this.state2[this.keys.KEY_B] = value; break;     // Num-9
            case this.key2Setting.KEY_SELECT: this.state2[this.keys.KEY_SELECT] = value; break; // Num-3
            case this.key2Setting.KEY_START: this.state2[this.keys.KEY_START] = value; break;  // Num-1
            case this.key2Setting.KEY_UP: this.state2[this.keys.KEY_UP] = value; break;    // Num-8
            case this.key2Setting.KEY_DOWN: this.state2[this.keys.KEY_DOWN] = value; break;   // Num-2
            case this.key2Setting.KEY_LEFT: this.state2[this.keys.KEY_LEFT] = value; break;  // Num-4
            case this.key2Setting.KEY_RIGHT: this.state2[this.keys.KEY_RIGHT] = value; break; // Num-6
            default: ret++;
        }
        if (ret==2) return true;
        return false; // preventDefault
    },
    
    setKey1: function(key, value) {
        switch (key) {
            case this.key1Setting.KEY_A: this.state1[this.keys.KEY_A] = value; 
                document.getElementById('button_a').style.background = value==64?"url('/images/m/button_a.png')":"url('/images/m/button_a_over.png')"; break;      // X
            case this.key1Setting.KEY_B: this.state1[this.keys.KEY_B] = value; 
                document.getElementById('button_b').style.background = value==64?"url('/images/m/button_b.png')":"url('/images/m/button_b_over.png')"; break;      // Z
            case this.key1Setting.KEY_SELECT: this.state1[this.keys.KEY_SELECT] = value; 
                document.getElementById('button_select').style.background = value==64?"url('/images/m/r_button_select.png')":"url('/images/m/r_button_select_over.png')"; break; // Right Ctrl
            case this.key1Setting.KEY_START: this.state1[this.keys.KEY_START] = value; 
                document.getElementById('button_start').style.background = value==64?"url('/images/m/r_button_start.png')":"url('/images/m/r_button_start_over.png')"; break;  // Enter
            case this.key1Setting.KEY_UP: this.state1[this.keys.KEY_UP] = value; 
                document.getElementById('button_up').style.background = value==64?"url('/images/m/button_up.png')":"url('/images/m/button_up_over.png')"; break;     // Up
            case this.key1Setting.KEY_DOWN: this.state1[this.keys.KEY_DOWN] = value;
                document.getElementById('button_down').style.background = value==64?"url('/images/m/button_down.png')":"url('/images/m/button_down_over.png')"; break;   // Down
            case this.key1Setting.KEY_LEFT: this.state1[this.keys.KEY_LEFT] = value; 
                document.getElementById('button_left').style.background = value==64?"url('/images/m/button_left.png')":"url('/images/m/button_left_over.png')"; break;   // Left
            case this.key1Setting.KEY_RIGHT: this.state1[this.keys.KEY_RIGHT] = value; 
                document.getElementById('button_right').style.background = value==64?"url('/images/m/button_right.png')":"url('/images/m/button_right_over.png')"; break;  // Right
            default: return true;
        }
        return false; // preventDefault
    },

    setKey2: function(key, value) {
        switch (key) {
            case this.key2Setting.KEY_A: this.state2[this.keys.KEY_A] = value; break;     // Num-7
            case this.key2Setting.KEY_B: this.state2[this.keys.KEY_B] = value; break;     // Num-9
            case this.key2Setting.KEY_SELECT: this.state2[this.keys.KEY_SELECT] = value; break; // Num-3
            case this.key2Setting.KEY_START: this.state2[this.keys.KEY_START] = value; break;  // Num-1
            case this.key2Setting.KEY_UP: this.state2[this.keys.KEY_UP] = value; break;    // Num-8
            case this.key2Setting.KEY_DOWN: this.state2[this.keys.KEY_DOWN] = value; break;   // Num-2
            case this.key2Setting.KEY_LEFT: this.state2[this.keys.KEY_LEFT] = value; break;  // Num-4
            case this.key2Setting.KEY_RIGHT: this.state2[this.keys.KEY_RIGHT] = value; break; // Num-6
            default: return true;
        }
        return false; // preventDefault
    },

    updateKEY_A: function(KEY_A) {
        this.key1Setting.KEY_A = KEY_A;
    },
    updateKEY_B: function(KEY_B) {
        this.key1Setting.KEY_B = KEY_B;
    },
    updateKEY_SELECT: function(KEY_SELECT) {
        this.key1Setting.KEY_SELECT = KEY_SELECT;
    },
    updateKEY_START: function(KEY_START) {
        this.key1Setting.KEY_START = KEY_START;
    },
    updateKEY_UP: function(KEY_UP) {
        this.key1Setting.KEY_UP = KEY_UP;
    },
    updateKEY_DOWN: function(KEY_DOWN) {
        this.key1Setting.KEY_DOWN = KEY_DOWN;
    },
    updateKEY_LEFT: function(KEY_LEFT) {
        this.key1Setting.KEY_LEFT = KEY_LEFT;
    },
    updateKEY_RIGHT: function(KEY_RIGHT) {
        this.key1Setting.KEY_RIGHT = KEY_RIGHT;
    },

    updateKEY_A2: function(KEY_A) {
        this.key2Setting.KEY_A = KEY_A;
    },
    updateKEY_B2: function(KEY_B) {
        this.key2Setting.KEY_B = KEY_B;
    },
    updateKEY_SELECT2: function(KEY_SELECT) {
        this.key2Setting.KEY_SELECT = KEY_SELECT;
    },
    updateKEY_START2: function(KEY_START) {
        this.key2Setting.KEY_START = KEY_START;
    },
    updateKEY_UP2: function(KEY_UP) {
        this.key2Setting.KEY_UP = KEY_UP;
    },
    updateKEY_DOWN2: function(KEY_DOWN) {
        this.key2Setting.KEY_DOWN = KEY_DOWN;
    },
    updateKEY_LEFT2: function(KEY_LEFT) {
        this.key2Setting.KEY_LEFT = KEY_LEFT;
    },
    updateKEY_RIGHT2: function(KEY_RIGHT) {
        this.key2Setting.KEY_RIGHT = KEY_RIGHT;
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

    keyDown1: function(evt) {
        if (!this.setKey1(evt.keyCode, 0x41) && evt.preventDefault) {
            evt.preventDefault();
        }
    },
    
    keyUp1: function(evt) {
        if (!this.setKey1(evt.keyCode, 0x40) && evt.preventDefault) {
            evt.preventDefault();
        }
    },

    keyDown2: function(evt) {
        if (!this.setKey2(evt.keyCode, 0x41) && evt.preventDefault) {
            evt.preventDefault();
        }
    },
    
    keyUp2: function(evt) {
        if (!this.setKey2(evt.keyCode, 0x40) && evt.preventDefault) {
            evt.preventDefault();
        }
    },
    
    keyPress: function(evt) {
        evt.preventDefault();
    }
};
