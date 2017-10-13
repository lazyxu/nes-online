import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { connect } from 'react-redux'

import './main.scss'
import Index from './container/Index.jsx'
import GameInfo from './container/GameInfo/GameInfo'
import GameList from './container/GameList/GameList'
import RoomList from './container/RoomList/RoomList'

import Active from './container/Account/Active'
import ResetPassword from './container/Account/ResetPassword'
import SettingAccount from './container/Setting/Account'
import Room from './container/Room/Room'
import Game from './container/Game/Game'
import actions from './actions/actions'
import store from './store.js'


import constant from './constant.js'
import userApi from './api/user.js'

// const requireAuth = (nextState, replace) => {
//   if (store.getState().user.type == constant.USER_UNLOGIN) {
//     replace({ pathname: '/roomList' })
//   }
// }

ReactDOM.render(
  <div>
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="/" component={Index}>
          <IndexRoute component={GameList} />
          <Route path="/gameList" component={GameList} />
          <Route path="/game/:gameName" component={GameInfo} />
          <Route path="/roomList" component={RoomList} />
          <Route path="/active/:active_code" component={Active} />
          <Route path="/resetPassword/:verifyCode" component={ResetPassword} />
          <Route path="/settings/account" component={SettingAccount} />
          <Route path="/room/:roomID" component={Room} />
          <Route path="/room/:roomID/play" component={Game} />
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('App')
);