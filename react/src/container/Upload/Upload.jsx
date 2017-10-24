import React from 'react'
import { Link } from 'react-router'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import './Upload.scss'

import jsnes from '../../utils/jsnes/index.js'
import constant from '../../utils/constant.js'
import romApi from '../../utils/api/rom.js'

class Upload extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      frameID: 0,
      files: [],
    }
    this.fileState = {
      waiting: "waiting",
      loading: "loading",
      success: "success",
      failed: "failed",
    }
    this.frameInterval = null
  }

  componentDidMount() {
    this.nes = new jsnes.NES({})
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

    this.perBuffer = new Array(256 * 240)
    this.sameCount = 0
    this.maxSameCount = 0
    this.nes.opts.onFrame = buffer => {
      var i = 0;
      var same = true;
      for (var y = 0; y < 240; ++y) {
        for (var x = 0; x < 256; ++x) {
          i = y * 256 + x;
          if (buffer[i] != this.perBuffer[i]) {
            same = false;
          }
          // Convert pixel from NES BGR to canvas ABGR
          this.buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
        }
      }
      if (same) {
        this.sameCount++
      } else {
        this.maxSameCount = this.maxSameCount > this.sameCount ? this.maxSameCount : this.sameCount
        this.sameCount = 0
      }
      this.perBuffer = buffer
      this.canvasImageData.data.set(this.buf8);
      this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }
  }

  componentWillUnmount() {
    clearInterval(this.frameInterval)
    this.nes.opts.onFrame(() => { })
  }

  submitHandler(event) {
    event.preventDefault()
    this.refs.folder.disabled = true
    this.refs.rom.disabled = true
    this.refs.submit.disabled = true
    this.state.files = []
    for (var i = 0; i < this.refs.rom.files.length; i++) {
      this.state.files[i] = {
        className: this.fileState.waiting,
        msg: "Waiting",
        name: "",
      }
    }
    this.setState({
      total: this.refs.rom.files.length,
      files: this.state.files,
    })
    this.fileIndex = -1,
      this.loadNext()
    return false
  }

  setOnFrame(func) {
    this.nes.opts.onFrame = func
  }

  loadNext() {
    this.fileIndex++
    this.sameCount = 0
    this.maxSameCount = 0
    if (this.frameInterval != null) {
      clearInterval(this.frameInterval)
    }
    if (this.fileIndex >= this.refs.rom.files.length) {
      this.refs.folder.disabled = false
      this.refs.rom.disabled = false
      this.refs.submit.disabled = false
      return
    }
    var romElem = this.refs.rom.files[this.fileIndex]
    this.state.files[this.fileIndex].name = romElem.name
    this.setState({ files: this.state.files })
    var reader = new FileReader()
    reader.readAsBinaryString(romElem)
    reader.onload = (e) => {
      var romData = e.target.result
      try {
        this.nes.loadROM(romData)
        this.setState({ frameID: 0 })
        this.frameInterval = setInterval(() => {
          this.nes.frame()
          if (this.state.frameID == 60 * 5) {
            console.log(this.maxSameCount)
            if (this.maxSameCount > 60) {
              this.setDataURL("")
            } else {
              this.setDataURL(this.refs.screen.toDataURL("image/jpeg"))
            }
          }
          this.setState({ frameID: this.state.frameID + 1 })
        }, 1000 / 60)
      } catch (err) {
        this.state.files[this.fileIndex].className = this.fileState.failed
        this.state.files[this.fileIndex].msg = '不支持的rom'
        this.setState({ files: this.state.files })
        this.loadNext()
      }
    }
  }

  setDataURL(url) {
    if (url == "") {
      this.state.files[this.fileIndex].className = this.fileState.failed
      this.state.files[this.fileIndex].msg = '运行失败'
      this.setState({ files: this.state.files })
      this.loadNext()
      return
    }
    this.state.files[this.fileIndex].className = this.fileState.loading
    this.state.files[this.fileIndex].msg = '准备上传'
    this.setState({ files: this.state.files })
    romApi.uploadROM(this.refs.folder.value,this.refs.rom.files[this.fileIndex], url).then(resp => {
      this.state.files[this.fileIndex].className = resp.error ? this.fileState.failed : this.fileState.success
      this.state.files[this.fileIndex].msg = resp.msg
      this.setState({ files: this.state.files })
      this.loadNext()
    })
  }

  render() {
    return (
      <div>
        <form class="fupload" onSubmit={this.submitHandler.bind(this)}>
          分类：<input ref="folder" type="text" /><br />
          <input ref="rom" type="file" multiple /><br />
          <input ref="submit" type="submit" value="上传rom" />
        </form>
        <canvas ref='screen' class="Screen" width="256" height="240"></canvas>
        <div type="text" ref="total" >文件总数：{this.state.total}</div>
        <div className="UploadFiles">
          {this.state.files.map(file => {
            return (
              <div className="line">
                <div className={'rect ' + file.className}></div>
                <span>{file.name + ': ' + file.msg}</span>
              </div>
            )
          }
          )}
        </div>
      </div>
    )
  }
}

export default Upload