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
import Room from './container/Room/Room'
import Active from './container/MaskLayer/Active'
import Register from './container/MaskLayer/Register'
import Login from './container/MaskLayer/Login'
import ForgetPassword from './container/MaskLayer/ForgetPassword'
import ForgetPasswordReset from './container/MaskLayer/ForgetPasswordReset'
import actions from './actions/actions'
import store from './store.js'

ReactDOM.render(
  <div>
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="/" component={Index}>
          <IndexRoute component={GameList}/>
          <Route path="/login" component={Login}/>
          <Route path="/game/:gameName" component={GameInfo}/>
          <Route path="/room/:roomID" component={Room}/>
          <Route path="/roomList" component={RoomList}/>
          {/* <Route path="/forgetPassword" component={ForgetPassword}/>
          <Route path="/forgetPassword/reset" component={ForgetPasswordReset}/> */}
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('App')
);