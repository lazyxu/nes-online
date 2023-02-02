import React from 'react'
import { connect } from 'react-redux'

import './PatternTable.scss'

class PatternTable extends React.Component {

  constructor(props) {
    super(props);
    this.patternTable = new Array(256)
    for (var i = 0; i < this.patternTable.length; i++) {
      this.patternTable[i] = ''
    }
  }

  update(j) {
    var canvasContext = this.refs[j].getContext("2d");
    var canvasImageData = canvasContext.getImageData(0, 0, 8, 8);
    var buf = new ArrayBuffer(canvasImageData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var buf32 = new Uint32Array(buf);
    for (var y = 0; y < 64; ++y) {
      buf32[y] = 0xff000000 | this.props.nes.ppu.palette.loadImage(
        this.props.nes.ppu.patternTable.colorIndexBit01(
          j + this.props.id * 256,
          y & 0b111,
          y >> 3
        )
      );
    }
    canvasImageData.data.set(buf8);
    canvasContext.putImageData(canvasImageData, 0, 0);
  }

  componentDidMount() {
    this.props.addAction(frameID => {
      if (frameID % 60 == 0) {
        for (var j = 0; j < 256; j++) {
          this.update(j)
        }
      }
    })
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div className="PatternTable">
        <div className="table">
          <div>{this.props.name}</div>
          {this.patternTable.map((pattern, index) => {
            return (
              <li className="rect"><canvas width="8" height="8" ref={index}></canvas></li>
            )
          })}
        </div>
      </div>
    )
  }
}

export default PatternTable;