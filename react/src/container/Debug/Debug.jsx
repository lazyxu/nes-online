import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Debug.scss'

import Controller from './Controller.jsx'
import Screen from './Screen.jsx'

import jsnes from './jsnes/index.js'
import constant from '../../utils/constant.js'
import romApi from '../../utils/api/rom.js'

class Debug extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      frameID: 0,
      keyboard: constant.DEFAULT_KEYBOARD,
    }
    this.frameInterval = null
  }

  componentWillMount() {
    this.nes = new jsnes.NES({})
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
    this.nes.opts.onFrame(() => { })
  }

  changeHandler(event) {
    event.preventDefault()
    if (this.frameInterval != null) {
      clearInterval(this.frameInterval)
    }
    var reader = new FileReader()
    reader.readAsBinaryString(this.refs.rom.files[0])
    reader.onload = (e) => {
      var romData = e.target.result
        this.nes.loadROM(romData)
        this.setState({ frameID: 0 })
        this.frameInterval = setInterval(() => {
          this.nes.frame()
          this.setState({ frameID: this.state.frameID + 1 })
        }, 1000 / 60)
    }
    return false
  }

  setOnFrame(func) {
    this.nes.opts.onFrame = func
  }

  render() {
    return (
      <div>
      <Controller
        keyboard={this.state.keyboard}
        nes={this.nes}
      />
        <form class="fupload" onChange={this.changeHandler.bind(this)}>
          <input ref="rom" type="file" /><br />
        </form>
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
        />
      </div>
    )
  }
}

export default Debug