import { ADD_INVOICE } from '../constants/invoiceConstants';

const invoiceReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_INVOICE:
      return [...state, action.payload];
    default:
      return state;
  }
};

export default invoiceReducer;
