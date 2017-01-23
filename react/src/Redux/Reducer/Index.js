import { combineReducers } from 'redux';
import ToDos from './ToDos';
import VisibilityFilter from './VisibilityFilter';

const rootReducer = combineReducers({
  ToDos,
  VisibilityFilter
});

export default rootReducer;