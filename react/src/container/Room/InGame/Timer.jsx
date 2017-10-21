import React from 'react'

import './Timer.scss'

class Timer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    var second = parseInt((this.props.frameID/60)%60);
    if(second < 10){
      second = "0" + second;
    }
    var minutes = parseInt((this.props.frameID/60)/60%60);
    if(minutes < 10){
      minutes = "0" + minutes;
    }
    var hour = parseInt((this.props.frameID/60)/3600);
    if(hour < 10){
      hour = "0" + hour;
    }
    var time = hour+":"+minutes+":"+second;
    return (
        <input type='text' value={time} className="Timer" disabled />
    );
  }
}

export default Timer;