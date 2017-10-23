import React from 'react'
import { connect } from 'react-redux'

class Screen extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var canvasContext = this.refs.screen.getContext('2d');
    var canvasImageData = canvasContext.getImageData(0, 0, 256, 240);
    // Get the canvas buffer in 8bit and 32bit
    var buf = new ArrayBuffer(canvasImageData.data.length);
    var buf8 = new Uint8ClampedArray(buf);
    var buf32 = new Uint32Array(buf);

    // Fill the canvas with black
    canvasContext.fillStyle = 'black';
    // set alpha to opaque
    canvasContext.fillRect(0, 0, 256, 240);

    // Set alpha
    for (var i = 0; i < buf32.length; ++i) {
      buf32[i] = 0xFF000000;
    }
    var frameID = 0
    this.props.setOnFrame(buffer => {
      var i = 0;
      for (var y = 0; y < 240; ++y) {
        for (var x = 0; x < 256; ++x) {
          i = y * 256 + x;
          // Convert pixel from NES BGR to canvas ABGR
          buf32[i] = 0xFF000000 | buffer[i]; // Full alpha
        }
      }
      canvasImageData.data.set(buf8);
      canvasContext.putImageData(canvasImageData, 0, 0);
      frameID++
      if (frameID == 120) {
        this.props.setDataURL(this.refs.screen.toDataURL("image/jpeg"))
      }
    })
  }

  componentWillUnmount() {
    this.props.setOnFrame(() => { })
  }

  render() {
    return (
      <div>
        <canvas ref='screen' class="Screen" width="256" height="240"></canvas>
      </div>
    )
  }
}

export default Screen;