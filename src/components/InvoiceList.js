import React from "react";
import { useSelector } from "react-redux";

function InvoiceList() {
  const invoices = useSelector((state) => state.invoice.invoices);

  // console.log("invoices------->>>>",invoices.lineItems[0]);

  const getStatus = (dueDate) => {
    const currentDate = new Date();
    const invoiceDueDate = new Date(dueDate);

    // Set hours, minutes, seconds, and milliseconds to zero for comparison
    currentDate.setHours(0, 0, 0, 0);
    invoiceDueDate.setHours(0, 0, 0, 0);
    
    if (invoiceDueDate < currentDate) {
        return 'Late';
    } else if (invoiceDueDate > currentDate) {
        return 'Outstanding';
    } else {
        return 'Due Today'; // Optionally handle today's due date
    }
}
  return (
    <div>
      <h2 className="text-[36px] tracking-[-1px] leading-[1.2]  mb-6 mt-6">Invoices Lists</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="rounded-tl-lg rounded-tr-lg bg-[#733DD9]">
            <th className="px-4 py-2 text-left col-span-2">Client Name</th>
            <th className="px-4 py-2 text-left col-span-1">Due Date</th>
            <th className="px-4 py-2 text-left col-span-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td className="px-4 py-2">{invoice.client}</td>
              <td className="px-4 py-2">{invoice.dueDate}</td>
              <td className="px-4 py-2">{getStatus(invoice.dueDate)}</td>{" "}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceList;
