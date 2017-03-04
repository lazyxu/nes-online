var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  requestAnimationFrame(updateStatus);
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  var i = 0;
  var j;

  for (j in controllers) {
    var controller = controllers[j];

    // console.log("buttons");
    for (i = 0; i < controller.buttons.length; i++) {
      // console.log(i, controller.buttons[i].pressed);
    }
    if (window.nes!=null) {
      // console.log(controller.axes[9] + 1);
      var direction = Math.round((controller.axes[9] + 1)*7/2);
      // console.log(direction);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].up, direction==7||direction==0||direction==1?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].down, direction==3||direction==4||direction==5?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].left, direction==5||direction==6||direction==7?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].right, direction==1||direction==2||direction==3?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].select, controller.buttons[8].pressed?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].start, controller.buttons[9].pressed?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].A, controller.buttons[2].pressed?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].B, controller.buttons[1].pressed?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].X, controller.buttons[3].pressed?0x41:0x40);
      window.nes.keyboard.setKey(0, window.nes.keyboard.player[0].Y, controller.buttons[0].pressed?0x41:0x40);
      
      // window.nes.keyboard.state[0][window.nes.keyboard.keys.up] = direction==7||direction==0||direction==1?0x41:0x40;
      // window.nes.keyboard.state[0][window.nes.keyboard.keys.down] = direction==3||direction==4||direction==5?0x41:0x40;
      // window.nes.keyboard.state[0][window.nes.keyboard.keys.left] = direction==5||direction==6||direction==7?0x41:0x40;
      // window.nes.keyboard.state[0][window.nes.keyboard.keys.right] = direction==1||direction==2||direction==3?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.select] = controller.buttons[8].pressed?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.start] = controller.buttons[9].pressed?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.A] = controller.buttons[2].pressed?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.B] = controller.buttons[1].pressed?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.X] = controller.buttons[3].pressed?0x41:0x40;
      window.nes.keyboard.state[0][window.nes.keyboard.keys.Y] = controller.buttons[0].pressed?0x41:0x40;
    }

    // console.log("axes");
    for (i = 0; i < controller.axes.length; i++) {
      // console.log(i, controller.axes[i].toFixed(4), controller.axes[i] + 1);
    }

  }

  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", () => {
  delete controllers[gamepad.index];
});

if (!haveEvents) {
  setInterval(scangamepads, 500);
}