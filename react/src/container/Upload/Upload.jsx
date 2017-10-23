import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Upload.scss'
import Screen from './Screen.jsx'
import Controller from './Controller.jsx'

import jsnes from '../../utils/jsnes/index.js'
import constant from '../../utils/constant.js'
import romApi from '../../utils/api/rom.js'

class Upload extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      keyboard: constant.DEFAULT_KEYBOARD,
      dataURI: "",
    }
    this.frameInterval = null
    this.nes = new jsnes.NES({})
    this.frameID = 0
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  submitHandler(event) {
    event.preventDefault()
    console.log(this.refs.rom.files)
    var reader = new FileReader()
    reader.readAsBinaryString(this.refs.rom.files[0])
    reader.onload = (e) => {
      console.log(e)
      this.nes.loadROM(e.target.result)
      if (this.frameInterval != null) {
        clearInterval(this.frameInterval)
      }
      this.frameInterval = setInterval(() => {
        this.nes.frame()
        this.frameID++
      }, 1000 / 60)
    }
    return false
  }

  setOnFrame(func) {
    this.nes.opts.onFrame = func
  }

  setDataURL(url) {
    this.setState({dataURI: url})
    romApi.uploadROM("temp", this.nes.romData, url)
  }
  
  render() {
    return (
      <div>
        <form class="fupload" onSubmit={this.submitHandler.bind(this)}>
          <label for="upload-file">选择本地rom</label>
          <input ref="rom" type="file" />
          <div class="rom_name" >未选择任何游戏</div>
          <input type="submit" value="上传rom" />
        </form>
        <Controller
          keyboard={this.state.keyboard}
          nes={this.nes}
        />
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
          setDataURL={this.setDataURL.bind(this)}
        />
      </div>
    )
  }
}

export default Upload