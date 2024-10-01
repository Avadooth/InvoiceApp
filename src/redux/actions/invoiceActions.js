export const ADD_INVOICE = 'ADD_INVOICE';

export const addInvoice = (invoice) => {
  return {
    type: ADD_INVOICE,
    payload: invoice,
  };
};
