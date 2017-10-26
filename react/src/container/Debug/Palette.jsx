import React from 'react'
import { connect } from 'react-redux'

import './Palette.scss'

class Palette extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      palette: [],
      imagePalette: [],
      spritPalette: [],
    }
  }

  componentDidMount() {
    for (var i = 0; i < 64; i++) {
      var color = this.props.nes.ppu.palette.getColor(i);
      this.state.palette[i] = 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
    }
    this.setState({ palette: this.state.palette })
    this.props.addAction(frameID => {
      if (frameID % 60 == 0) {
        for (var i = 0; i < 16; i++) {
          var color = this.props.nes.ppu.palette.loadImage(i);
          this.state.imagePalette[i] = 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
          color = this.props.nes.ppu.palette.loadSprit(i);
          this.state.spritPalette[i] = 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
        }
        this.setState({ imagePalette: this.state.imagePalette })
        this.setState({ spritPalette: this.state.spritPalette })
      }
    })
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Palette">
        <div>
          <div>palette:</div>
          {this.state.palette.map((color) => {
            return (
              <li className="rect" style={{ backgroundColor: color }}></li>
            )
          })}
        </div>
        <div>
          <div>imagePalette:</div>
          {this.state.imagePalette.map((color) => {
            return (
              <li className="rect" style={{ backgroundColor: color }}></li>
            )
          })}
        </div>
        <div>
          <div>spritPalette:</div>
          {this.state.spritPalette.map((color) => {
            return (
              <li className="rect" style={{ backgroundColor: color }}></li>
            )
          })}
        </div>
      </div>
    )
  }
}

export default Palette;