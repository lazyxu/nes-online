import React from 'react'
import { connect } from 'react-redux'

import userApi from '../../api/user.js'
import gameApi from '../../api/game.js'
import keyboardApi from '../../api/keyboard.js'
import ws from '../../websocket/index.js'
import constant from '../../constant.js'
import Normal from './Normal/Room.jsx'
import InGame from './InGame/Room.jsx'
import jsnes from '../../jsnes/index.js'

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            room: {
                id: this.props.params.roomID,
                state: constant.ROOM_STATE_NORMAL,
            },
            id_in_room: -1,
            loadingState: constant.LOADINGROOM,
            keyboard: constant.DEFAULT_KEYBOARD,
        }
    }

    updateKeyboard(keyboard) {
        keyboardApi.update(keyboard).then(resp => {
            if (resp.error) {
                alert(resp.msg)
            }
            this.setState({ keyboard: resp.data })
        })
    }

    componentWillMount() {
        window.nes = new jsnes.NES();
        ws.addOnmessage('id_in_room', data => {
            this.setState({ id_in_room: data.id_in_room })
        })
        keyboardApi.get().then(resp => {
            if (resp.error) {
                alert(resp.msg)
                return
            }
            this.setState({ keyboard: resp.data })
        })
        ws.addOnmessage('roomErrMsg', data => {
            alert(data.roomErrMsg)
            location.href = '#/roomList/'
        })
        ws.addOnmessage('roomStateChange', data => {
            this.setState({ room: data.room })
            if (this.state.loadingState == constant.LOADINGROOM) {
                this.setState({ loadingState: constant.LOADINGMAP })
                gameApi.getRom(data.room.game).then(resp => {
                    this.setState({ loadingState: constant.LOADED })
                    window.nes.loadROM(resp)
                })
            }
        })
        ws.send({
            type: 'enterRoom',
            "roomID": this.props.params.roomID
        })
    }

    componentWillUnmount() {
        ws.removeOnmessage("id_in_room")
        ws.removeOnmessage("roomErrMsg")
        ws.removeOnmessage("roomStateChange")
    }

    render() {
        return (
            <div>
                <div className="LocationBar">
                    <a href="#/gameList">游戏大厅</a> | <a href="#/roomList/">房间列表</a>
                </div>
                {
                    this.state.room == null ?
                        <div /> :
                        (this.state.room.state == constant.ROOM_STATE_IN_GAME &&
                            this.state.room.players[this.state.id_in_room].state_in_room == constant.ROOM_PLAYER_STATE_IN_GAME) ?
                            <InGame
                                room={this.state.room}
                                id_in_room={this.state.id_in_room}
                                keyboard={this.state.keyboard}
                                updateKeyboard={this.updateKeyboard.bind(this)}
                            /> :
                            <Normal
                                room={this.state.room}
                                id_in_room={this.state.id_in_room}
                                loadingState={this.state.loadingState}
                            />
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