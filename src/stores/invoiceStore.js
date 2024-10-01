import { EventEmitter } from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher.js';
import { ADD_INVOICE } from '../constants/invoiceConstants.js';

let invoices = [];

class InvoiceStore extends EventEmitter {
  getAll() {
    return invoices;
  }

  addInvoice(invoice) {
    invoices.push(invoice);
    this.emit('change');
  }

  handleActions(action) {
    switch (action.type) {
      case ADD_INVOICE:
        this.addInvoice(action.payload);
        break;
      default:
    }
  }
}

const invoiceStore = new InvoiceStore();

AppDispatcher.register(invoiceStore.handleActions.bind(invoiceStore));

export default invoiceStore;
