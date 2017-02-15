import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { connect } from 'react-redux'

import App from './container/App.jsx'
import Active from './container/MaskLayer/Active'
import Register from './container/MaskLayer/Register'
import Login from './container/MaskLayer/Login'
import ForgetPassword from './container/MaskLayer/ForgetPassword'
import ForgetPasswordReset from './container/MaskLayer/ForgetPasswordReset'
import reducers from './reducers/reducers'
import actions from './actions/actions'

const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
  <div>
    <Provider store={store}>
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <Route path="/active/:active_code" component={Active}/>
          <Route path="/register" component={Register}/>
          <IndexRoute component={Login}/>
          <Route path="/forgetPassword" component={ForgetPassword}/>
          <Route path="/forgetPassword/reset" component={ForgetPasswordReset}/>
        </Route>
      </Router>
    </Provider>
  </div>,
  document.getElementById('App')
);
