import React from 'react'
import ReactDOM from 'react-dom'

import { createStore } from 'redux'
import { Provider } from 'react-redux'

import Index from './pages/Index/Index'
import reducers from './reducers/reducers'
import actions from './actions/actions'

const store = createStore(reducers);
store.dispatch(actions.setMask('login'));

const index = document.createElement('div');
document.body.appendChild(index);
ReactDOM.render(
    <div>
        <Provider store={store}>
          <Index />
        </Provider>
    </div>,
    index);
