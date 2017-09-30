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
import Register from './container/Account/Register'
import Logout from './container/Account/Logout'
import Login from './container/Account/Login'
import VisitorLogin from './container/Account/VisitorLogin'
import ForgetPassword from './container/Account/ForgetPassword'
import ResetPassword from './container/Account/ResetPassword'
import SettingAccount from './container/Setting/Account'
import Room from './container/Room/Room'
import actions from './actions/actions'
import store from './store.js'

ReactDOM.render(
  <div>
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="/" component={Index}>
          <IndexRoute component={GameList}/>
          <Route path="/gameList" component={GameList}/>
          <Route path="/game/:gameName" component={GameInfo}/>
          <Route path="/roomList" component={RoomList}/>
          <Route path="/login" component={Login}/>
          <Route path="/visitorLogin" component={VisitorLogin}/>
          <Route path="/logout" component={Logout}/>
          <Route path="/register" component={Register}/>
          <Route path="/active/:active_code" component={Active}/>
          <Route path="/forgetPassword" component={ForgetPassword}/>
          <Route path="/resetPassword/:verifyCode" component={ResetPassword}/>
          <Route path="/settings/account" component={SettingAccount}/>
          <Route path="/game/:gameName/room/:roomID" component={Room}/>
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('App')
);