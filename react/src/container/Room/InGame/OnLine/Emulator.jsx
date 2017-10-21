import React from 'react'
import { connect } from 'react-redux'

import constant from '../../../../constant.js'
import ws from '../../../../websocket/index.js'
import P2PHost from './P2PHost.jsx'
import P2PClient from './P2PClient.jsx'
import WSClient from './WSClient.jsx'
import Screen from './Screen.jsx'

class Emulator extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      connectionType: constant.CONNECTION_TYPE_PEER_CONNECTION,
    }
  }

  componentWillMount() {
    ws.addOnmessage('protocolSwitch', data => {
      console.log(data)
      this.setState({ connectionType: data.connectionType })
    })
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    ws.removeOnmessage('protocolSwitch')
  }

  render() {
    return (
      <div>
        {this.state.connectionType == constant.CONNECTION_TYPE_PEER_CONNECTION ?
          (this.props.id_in_room == 0 ?
            <P2PHost
              room={this.props.room}
              id_in_room={this.props.id_in_room}
              nes={this.props.nes}
              keyboard={this.props.keyboard}
              addMsg={this.props.addMsg}
              isRunning={this.props.isRunning}
              frameID={this.props.frameID}
              addFrameID={this.props.addFrameID}
            /> :
            <P2PClient
              room={this.props.room}
              id_in_room={this.props.id_in_room}
              nes={this.props.nes}
              keyboard={this.props.keyboard}
              addMsg={this.props.addMsg}
              isRunning={this.props.isRunning}
              frameID={this.props.frameID}
              addFrameID={this.props.addFrameID}
            />
          ) :
          <WSClient
            room={this.props.room}
            id_in_room={this.props.id_in_room}
            nes={this.props.nes}
            keyboard={this.props.keyboard}
            addMsg={this.props.addMsg}
            isRunning={this.props.isRunning}
            frameID={this.props.frameID}
            addFrameID={this.props.addFrameID}
          />
        }
      </div>
    )
  }
}

export default Emulator;