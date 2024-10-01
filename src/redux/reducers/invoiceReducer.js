import { ADD_INVOICE } from '../actions/invoiceActions.js';

const initialState = {
  invoices: [],
};

const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_INVOICE:
      return {
        ...state,
        invoices: [...state.invoices, action.payload],
      };
    default:
      return state;
  }
};

export default invoiceReducer;
