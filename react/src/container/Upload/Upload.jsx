import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Upload.scss'
import Screen from './Screen.jsx'

import jsnes from '../../utils/jsnes/index.js'
import constant from '../../utils/constant.js'
import romApi from '../../utils/api/rom.js'

class Upload extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      keyboard: constant.DEFAULT_KEYBOARD,
      total: 0,
      fileIndex: 0,
      filename: "",
      run_status: "",
      upload_status: "",
      frameID: 0,
    }
    this.files = {}
    this.frameInterval = null
    this.nes = new jsnes.NES({})
    this.romList = []
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
  }

  isNes(filename) {
    var index = filename.lastIndexOf(".");
    var ext = filename.substr(index + 1);
    console.log(ext)
    return ext == "nes"
  }

  submitHandler(event) {
    event.preventDefault()
    this.setState({
      fileIndex: 0,
      total: this.refs.rom.files.length,
    })
    this.loadNext()
    return false
  }

  setOnFrame(func) {
    this.nes.opts.onFrame = func
  }

  loadNext() {
    if (this.frameInterval != null) {
      clearInterval(this.frameInterval)
    }
    if (this.state.fileIndex >= this.refs.rom.files.length) {
      this.setState({ upload_status: "已完成" })
      console.log(this)
      return
    }
    var romElem = this.refs.rom.files[this.state.fileIndex]
    var reader = new FileReader()
    reader.readAsBinaryString(romElem)
    reader.onload = (e) => {
      this.setState({ reader_status: "正在读取第" + this.state.fileIndex + "份文件" })
      var romData = e.target.result
      try {
        this.nes.loadROM(romData)
        this.setState({ frameID: 0 })
        this.frameInterval = setInterval(() => {
          this.nes.frame()
          this.setState({ frameID: this.state.frameID + 1 })
        }, 1000 / 60)
      } catch (err) {
        this.setState({ upload_status: "第" + this.state.fileIndex + "份文件：failed" })
        this.setState({ run_status: "failed" })
        this.setState({ fileIndex: this.state.fileIndex + 1 })
        this.loadNext()
      }
    }
  }

  setDataURL(url) {
    if (url == "") {
      this.setState({ upload_status: "第" + this.state.fileIndex + "份文件：failed" })
      this.setState({ fileIndex: this.state.fileIndex + 1 })
      this.loadNext()
      return
    }
    this.setState({ upload_status: "第" + this.state.fileIndex + "份文件：准备上传" })
    romApi.uploadROM(this.refs.rom.files[this.state.fileIndex], url).then(resp => {
      this.setState({ upload_status: "第" + this.state.fileIndex + "份文件：" + resp.msg })
      this.setState({ fileIndex: this.state.fileIndex + 1 })
      this.loadNext()
    })
  }

  render() {
    return (
      <div>
        <div type="text" ref="total" >文件总数：{this.state.total}</div>
        <div type="text" ref="filename" >文件{this.state.fileIndex}：{this.state.filename} </div>
        <div type="text" ref="run_status" >运行状态：{this.state.run_status}</div>
        <div type="text" ref="upload_status">上传状态：{this.state.upload_status}</div>
        <form class="fupload" onSubmit={this.submitHandler.bind(this)}>
          <label for="upload-file">选择本地rom</label>
          <input ref="rom" type="file" multiple />
          <div class="rom_name" >未选择任何游戏</div>
          <input type="submit" value="上传rom" />
        </form>
        <Screen
          setOnFrame={this.setOnFrame.bind(this)}
          frameID={this.state.frameID}
          setDataURL={this.setDataURL.bind(this)}
        />
      </div>
    )
  }
}

export default Upload