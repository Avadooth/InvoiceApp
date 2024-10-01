import { combineReducers } from 'redux';
import invoiceReducer from './invoiceReducer.js';

const rootReducer = combineReducers({
  invoice: invoiceReducer,
});

export default rootReducer;
