import store from '../../store.js'
import actions from '../../actions/actions.js'
exports.handler = wsHandler => {
    wsHandler['createRoom'] = data => {
        if (data.from == store.getState().user.name) {
            location.href = '#/game/' + data.room.game + '/room/' + data.room.id
        }
    }
}