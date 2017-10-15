import React from 'react'
import { connect } from 'react-redux'

import './Emulator.scss'
import jsnes from '../../../jsnes/index.js'
import ws from '../../../websocket/index.js'
import constant from '../../../constant.js'
import gameApi from '../../../api/game.js'
import { roomSet, gameTabSet, msgAdd, msgSet, keyboardGet } from '../../../actions/actions'
// import Players from './Players.jsx'
// import Chat from './Chat.jsx'
// import Menu from './Menu.jsx'
// import keyboard from '../../api/user/keyboard.js'
class Emulator extends React.Component {

  constructor(props) {
    super(props);
  }

  keyupListener(e) {
    switch (e.keyCode) {
      case this.props.keyboard.A:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_A);
        break;
      case this.props.keyboard.B:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_B);
        break;
      case this.props.keyboard.select:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT);
        break;
      case this.props.keyboard.start:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_START);
        break;
      case this.props.keyboard.up:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
        break;
      case this.props.keyboard.down:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
        break;
      case this.props.keyboard.left:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
        break;
      case this.props.keyboard.right:
        window.nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
        break;
      default:
        break;
    }
  }

  keydownListener(e) {
    switch (e.keyCode) {
      case this.props.keyboard.A:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_A);
        break;
      case this.props.keyboard.B:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_B);
        break;
      case this.props.keyboard.select:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT);
        break;
      case this.props.keyboard.start:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_START);
        break;
      case this.props.keyboard.up:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_UP);
        break;
      case this.props.keyboard.down:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN);
        break;
      case this.props.keyboard.left:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT);
        break;
      case this.props.keyboard.right:
        window.nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT);
        break;
      default:
        break;
    }
  }

  resize() {
    var height = this.refs.emulator.clientHeight;
    var width = this.refs.emulator.clientWidth;
    var landscape = (height / 240 * 256 > width) ? false : true;
    if (!landscape) {
      this.refs.screen.style.height = (width / 256 * 240) + 'px'
      this.refs.screen.style.width = width + 'px'
    } else {
      this.refs.screen.style.height = height + 'px'
      this.refs.screen.style.width = (height / 240 * 256) + 'px'
    }
  }

  local() {
    window.nes.frame()
  }

  componentDidMount() {
    this.canvasContext = this.refs.screen.getContext('2d');
    this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
    // Get the canvas buffer in 8bit and 32bit
    this.buf = new ArrayBuffer(this.canvasImageData.data.length);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Fill the canvas with black
    this.canvasContext.fillStyle = 'black';
    // set alpha to opaque
    this.canvasContext.fillRect(0, 0, 256, 240);

    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xFF000000;
    }
    window.nes.opts.onFrame = (buffer) => {
      var i = 0;
      for (var y = 0; y < 240; ++y) {
        for (var x = 0; x < 256; ++x) {
          i = y * 256 + x;
          // Convert pixel from NES BGR to canvas ABGR
          this.buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
        }
      }
      this.canvasImageData.data.set(this.buf8);
      this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }
    this.resize();
    window.addEventListener("resize", this.resize.bind(this))
    document.getElementById('window').addEventListener("keyup", this.keyupListener.bind(this))
    document.getElementById('window').addEventListener("keydown", this.keydownListener.bind(this))

    window.nes.reloadROM()
    window.nes.frameIntervalFunction = this.local.bind(this)
    window.nes.start()
  }
  
  componentWillUnmount() {
    window.nes.opts.onFrame = () => { }
    clearInterval(window.nes.frameInterval)
    window.removeEventListener("resize", this.resize.bind(this))
    document.getElementById('window').removeEventListener("keyup", this.keyupListener.bind(this))
    document.getElementById('window').removeEventListener("keydown", this.keydownListener.bind(this))
  }

  render() {
    return (
      <div ref='emulator' className='Emulator'>
        <canvas ref='screen' class="nes-screen" width="256" height="240"></canvas>
      </div>
    )
  }
}

export default Emulator;