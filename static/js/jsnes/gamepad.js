JSNES.Gamepad = function(nes) {
    this.nes = nes;
    this.oldState = {
        up: 0x40,
        down: 0x40,
        left: 0x40,
        right: 0x40,
        select: 0x40,
        start: 0x40,
        A: 0x40,
        B: 0x40,
        X: 0x40,
        Y: 0x40,
    }
    this.newState = {
        up: 0x40,
        down: 0x40,
        left: 0x40,
        right: 0x40,
        select: 0x40,
        start: 0x40,
        A: 0x40,
        B: 0x40,
        X: 0x40,
        Y: 0x40,
    }
    setInterval( ()=> {
        this.updateStatus();
    }, 1000/60 );
}

JSNES.Gamepad.prototype = {
    updateStatus: function() {
        var gamepad = null;
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                gamepad = gamepads[i];
            }
        }
        if (gamepad != null) {
            var direction = Math.round((gamepad.axes[9] + 1)*7/2);
            this.newState = {
                up: direction==7||direction==0||direction==1?0x41:0x40,
                down: direction==3||direction==4||direction==5?0x41:0x40,
                left: direction==5||direction==6||direction==7?0x41:0x40,
                right: direction==1||direction==2||direction==3?0x41:0x40,
                select: gamepad.buttons[8].pressed?0x41:0x40,
                start: gamepad.buttons[9].pressed?0x41:0x40,
                A: gamepad.buttons[2].pressed?0x41:0x40,
                B: gamepad.buttons[1].pressed?0x41:0x40,
                X: gamepad.buttons[3].pressed?0x41:0x40,
                Y: gamepad.buttons[0].pressed?0x41:0x40,
            }
            for (var index in this.newState) {
                if (this.newState[index] != this.oldState[index]) {
                    var idInRoom = window.store.getState().user.idInRoom;
                    var value = this.newState[index];
                    console.log(window.nes.frameCount + "[gamepad] " + index + ": " + value==0x41?"down":"up");
                    window.nes.keyboardLog[window.nes.frameCount%window.nes.frameSend].push({
                        'key': index,
                        'value': this.newState[index],
                    });
                    window.keyboardAction[idInRoom][window.nes.frameDelay].push({
                        'key': index,
                        'value': this.newState[index],
                    });
                    // this.nes.keyboard.setKey(0, this.nes.keyboard.player[0][index], this.newState[index] );
                }
            }
            this.oldState = this.newState;
        }
    }
}