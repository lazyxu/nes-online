import React from 'react'
import { connect } from 'react-redux'

import jsnes from '../../../../jsnes/index.js'
import ws from '../../../../websocket/index.js'
import constant from '../../../../constant.js'
import operation from './operation.js'

class Controller extends React.Component {

  constructor(props) {
    super(props);
  }

  keyboardLog() {

  }

  operationEncode(command, state) {
    return operation.encode(this.props.frameCount, this.props.id_in_room, command, state)
  }

  keyupListener(e) {
    var nes = this.props.nes
    var keyboard = this.props.keyboard
    switch (e.keyCode) {
      case keyboard.A:
        this.props.addOperation(operation.COMMAND_BUTTON_A, operation.STATE_UNSET)
        break;
      case keyboard.B:
      this.props.addOperation(operation.COMMAND_BUTTON_B, operation.STATE_UNSET)
        break;
      case keyboard.select:
      this.props.addOperation(operation.COMMAND_BUTTON_SELECT, operation.STATE_UNSET)
        break;
      case keyboard.start:
      this.props.addOperation(operation.COMMAND_BUTTON_START, operation.STATE_UNSET)
        break;
      case keyboard.up:
      this.props.addOperation(operation.COMMAND_BUTTON_UP, operation.STATE_UNSET)
        break;
      case keyboard.down:
      this.props.addOperation(operation.COMMAND_BUTTON_DOWN, operation.STATE_UNSET)
        break;
      case keyboard.left:
      this.props.addOperation(operation.COMMAND_BUTTON_LEFT, operation.STATE_UNSET)
        break;
      case keyboard.right:
      this.props.addOperation(operation.COMMAND_BUTTON_RIGHT, operation.STATE_UNSET)
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
        this.props.addOperation(operation.COMMAND_BUTTON_A, operation.STATE_SET)
        break;
      case keyboard.B:
      this.props.addOperation(operation.COMMAND_BUTTON_B, operation.STATE_SET)
        break;
      case keyboard.select:
      this.props.addOperation(operation.COMMAND_BUTTON_SELECT, operation.STATE_SET)
        break;
      case keyboard.start:
      this.props.addOperation(operation.COMMAND_BUTTON_START, operation.STATE_SET)
        break;
      case keyboard.up:
      this.props.addOperation(operation.COMMAND_BUTTON_UP, operation.STATE_SET)
        break;
      case keyboard.down:
      this.props.addOperation(operation.COMMAND_BUTTON_DOWN, operation.STATE_SET)
        break;
      case keyboard.left:
      this.props.addOperation(operation.COMMAND_BUTTON_LEFT, operation.STATE_SET)
        break;
      case keyboard.right:
      this.props.addOperation(operation.COMMAND_BUTTON_RIGHT, operation.STATE_SET)
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

export default Controller;