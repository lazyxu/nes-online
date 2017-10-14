import React from 'react'
import { connect } from 'react-redux'

import userApi from '../../api/user.js'
import gameApi from '../../api/game.js'
import ws from '../../websocket/index.js'
import constant from '../../constant.js'
import Normal from './Normal/Room.jsx'
import InGame from './InGame/Room.jsx'

class Room extends React.Component {

    constructor(props) {
        super(props);
        constant.LOADINGROOM = 0
        constant.LOADINGMAP = 1
        constant.LOADED = 2
        this.state = {
            room: {
                id: this.props.params.roomID,
            },
            idInRoom: -1,
            loadingState: constant.LOADINGROOM,
        }
    }

    componentWillMount() {
        ws.addOnmessage('idInRoom', data => {
            this.setState({idInRoom: data.idInRoom})
        })
        ws.addOnmessage('roomErrMsg', data => {
            alert(data.roomErrMsg)
            history.go(-1)
        })
        ws.addOnmessage('roomStateChange', data => {
            if (this.state.loadingState == constant.LOADINGROOM) {
                this.setState({
                    room: data.room,
                    loadingState: constant.LOADINGMAP,
                })
                gameApi.getRom(data.room.game).then(resp => {
                    this.setState({ loadingState: constant.LOADED })
                    window.nes.loadROM(resp)
                })
            } else {
                this.setState({room: data.room})
            }
        })
        ws.send({
            type: 'enterRoom',
            "roomID": this.props.params.roomID
        })
    }

    componentWillUnmount() {
        ws.removeOnmessage("idInRoom")
        ws.removeOnmessage("roomErrMsg")
        ws.removeOnmessage("roomStateChange")
    }

    render() {
        return (
            <div>
                <div className="LocationBar">
                    <a href="#/gameList">游戏大厅</a> | <a href="#/roomList/">房间列表</a>
                </div>
                {this.state.room.state == constant.ROOM_STATE_NORMAL ?
                    <Normal
                        room={this.state.room}
                        idInRoom={this.state.idInRoom}
                        loadingState={this.state.loadingState}
                    /> :
                    (this.state.room.state == constant.ROOM_STATE_IN_GAME ?
                        <InGame
                            room={this.state.room}
                            idInRoom={this.state.idInRoom}
                        /> :
                        <div />)
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps, null)(Room);