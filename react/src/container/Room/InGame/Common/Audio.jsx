import React from 'react'
import { connect } from 'react-redux'

class Audio extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    var channels = 2       // 立体声
    var sampleRate = 44100 // 44100
    var frameCount= 8192  // 创建一个 采样率与音频环境(AudioContext)相同的 的 音频片段。
    var audioBuffer = audioCtx.createBuffer(channels, frameCount, sampleRate)
    var myFrameCount = 0;
    window.t = [];
    this.props.setOnAudioSample((left, right) => {
      window.t.push({left, right});
      if (this.props.emulateSound) {
        if (myFrameCount == frameCount) {
          var source = audioCtx.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioCtx.destination)
          source.start()
          myFrameCount = 0
        }
        audioBuffer.getChannelData(0)[myFrameCount] = left
        audioBuffer.getChannelData(1)[myFrameCount] = right
        myFrameCount++
      }
    })
  }

  componentWillUnmount() {
    this.props.setOnAudioSample(() => { })
  }

  render() {
    return (
      <div />
    )
  }
}

export default Audio;