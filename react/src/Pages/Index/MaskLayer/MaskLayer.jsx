import './main.scss'
import React from 'react'
import Login from './Login/Login'

export default class MaskLayer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.mask=="") {
      return (
        <div />
      )
    }
    return (
      <div className='MaskLayer'>
        {this.props.mask=="login" && <Login setMask={this.props.setMask}/>}
      </div>
    )
  }
}