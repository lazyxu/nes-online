import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { connect } from 'react-redux'

import './App.scss'
import Index from './container/Index.jsx'
import GameInfo from './container/GameInfo/GameInfo'
import GameList from './container/GameList/GameList'
import RoomList from './container/RoomList/RoomList'
import Active from './container/Account/Active'
import ResetPassword from './container/Account/ResetPassword'
import Setting from './container/Setting/Setting'
import Room from './container/Room/Room'
import Upload from './container/Upload/Upload'
import Debug from './container/Debug/Debug'

import actions from './utils/actions/index.js'
import store from './utils/store.js'
import constant from './utils/constant.js'
import userApi from './utils/api/user.js'

// const requireAuth = (nextState, replace) => {
//   if (store.getState().user.type == constant.USER_UNLOGIN) {
//     replace({ pathname: '/roomList' })
//   }
// }

var App = document.createElement('div');
document.body.appendChild(App);

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
          <Route path="/settings" component={Setting} />
          <Route path="/room/:roomID" component={Room} />
          <Route path="/upload" component={Upload} />
          <Route path="/debug" component={Debug} />
        </Route>
      </Router>
    </Provider>
  </div>,
  App
);