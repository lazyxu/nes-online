import React from 'react'
import { connect } from 'react-redux'

import jsnes from '../../../../jsnes/index.js'
class Emulator extends React.Component {

  constructor(props) {
    super(props);
  }

  keyupListener(e) {
    var nes = this.props.nes
    var keyboard = this.props.keyboard
    switch (e.keyCode) {
      case keyboard.A:
        nes.buttonUp(1, jsnes.Controller.BUTTON_A);
        break;
      case keyboard.B:
        nes.buttonUp(1, jsnes.Controller.BUTTON_B);
        break;
      case keyboard.select:
        nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT);
        break;
      case keyboard.start:
        nes.buttonUp(1, jsnes.Controller.BUTTON_START);
        break;
      case keyboard.up:
        nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
        break;
      case keyboard.down:
        nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
        break;
      case keyboard.left:
        nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
        break;
      case keyboard.right:
        nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
        break;
      default:
        break;
    }
  }
  
  keydownListener(e) {
    var nes = this.props.nes
    var keyboard = this.props.keyboard
    switch (e.keyCode) {
      case keyboard.A:
        nes.buttonDown(1, jsnes.Controller.BUTTON_A);
        break;
      case keyboard.B:
        nes.buttonDown(1, jsnes.Controller.BUTTON_B);
        break;
      case keyboard.select:
        nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT);
        break;
      case keyboard.start:
        nes.buttonDown(1, jsnes.Controller.BUTTON_START);
        break;
      case keyboard.up:
        nes.buttonDown(1, jsnes.Controller.BUTTON_UP);
        break;
      case keyboard.down:
        nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN);
        break;
      case keyboard.left:
        nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT);
        break;
      case keyboard.right:
        nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT);
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    document.getElementById('window').addEventListener("keyup", this.keyupListener.bind(this))
    document.getElementById('window').addEventListener("keydown", this.keydownListener.bind(this))
  }

  componentWillUnmount() {
    document.getElementById('window').removeEventListener("keyup", this.keyupListener)
    document.getElementById('window').removeEventListener("keydown", this.keydownListener)
  }

  render() {
    return (
      <div />
    )
  }
}

export default Emulator;