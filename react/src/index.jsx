import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { connect } from 'react-redux'

import App from './container/App.jsx'
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
        <Route path="/">
          <Route path="/active/:active_code" component={Active}/>
          <Route path="/register" component={Register}/>
          <IndexRoute component={App}/>
          <Route path="/login" component={Login}/>
          <Route path="/forgetPassword" component={ForgetPassword}/>
          <Route path="/forgetPassword/reset" component={ForgetPasswordReset}/>
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('App')
);
