import { createStore } from 'redux'

import reducers from './reducers/index'

const initialState = window.__INITIAL_STATE__;
// if (initialState.user==null && (location.hash==""||location.hash=="#/")) {
//     location.href = "#/login";
// }
window.store = createStore(reducers, initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
export default store