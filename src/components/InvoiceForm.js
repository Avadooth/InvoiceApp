import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addInvoice } from "../redux/actions/invoiceActions.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

function InvoiceForm() {
  const dispatch = useDispatch();
  const [invoice, setInvoice] = useState({
    client: "",
    lineItems: [
      {
        description: "",
        type: "hours",
        GST: 0,
        quantity: 1,
        rate: 0,
        Amount: 0,
        CGST: 0,
        SGST: 0,
        Total: 0,
      },
    ],
    notes: "",
    dueDate: "",
    status: "Outstanding",
  });

  const [error, setError] = useState("");
  const handleAmount = () => {
    const updatedLineItems = invoice.lineItems.map((item) => {
      const quantity = item.quantity || 0;
      const rate = item.rate || 0;
      const gst = item.GST || 0;
      const amount = quantity * rate; // Calculate amount for each line item   (Amount * (GST/2) / 100)
      const cgst = (amount * (gst / 2)) / 100; // Calculate CGST (9%)
      const sgst = (amount * (gst / 2)) / 100; // Calculate SGST (9%)
      const total = amount + cgst + sgst; // Total including GST

      return {
        ...item,
        Amount: amount.toFixed(2),
        CGST: cgst.toFixed(2),
        SGST: sgst.toFixed(2),
        Total: total.toFixed(2),
      };
    });

    setInvoice({ ...invoice, lineItems: updatedLineItems });
  };
  useEffect(() => {
    setError("");
  }, [invoice.client, invoice.dueDate, invoice.lineItems]);

  const totalAmount = () => {
    const totals = invoice.lineItems.reduce((acc, item) => {
      acc.amount = acc.amount || 0;
      acc.cgst = acc.cgst || 0;
      acc.sgst = acc.sgst || 0;
      acc.total = acc.total || 0;

      const amount = parseFloat(item.Amount) || 0;
      const cgst = parseFloat(item.CGST) || 0;
      const sgst = parseFloat(item.SGST) || 0;
      const total = parseFloat(item.Total) || 0;

      acc.amount += amount;
      acc.cgst += cgst;
      acc.sgst += sgst;
      acc.total += total;

      return acc;
    }, {});

    return {
      cgst: totals.cgst,
      sgst: totals.sgst,
      amount: totals.amount,
      total: totals.total,
    };
  };

  const totalAmounts = totalAmount();

  const handleAddLineItem = () => {
    setInvoice({
      ...invoice,
      lineItems: [
        ...invoice.lineItems,
        {
          description: "",
          type: "hours",
          GST: 0,
          quantity: 0,
          rate: 0,
          Amount: 0,
          CGST: 0,
          SGST: 0,
          Total: 0,
        },
      ],
    });
  };

  const removeLineItem = (index) => {
    const updatedLineItems = invoice.lineItems.filter((_, i) => i !== index);
    setInvoice({ ...invoice, lineItems: updatedLineItems });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...invoice.lineItems];
    updatedItems[index][field] = value;
    setInvoice({ ...invoice, lineItems: updatedItems });
    handleAmount();
  };

  const handleSubmit = () => {
    const hasEmptyLineItems = invoice.lineItems.some(
      (item) => !item.description || !item.quantity || !item.rate
    );

    if (!invoice.client || !invoice.dueDate || hasEmptyLineItems) {
      setError("Please fill out all required fields.");
      return;
    }

    dispatch(addInvoice(invoice));
  };
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Invoice Header
    doc.setFontSize(16);
    doc.text("Invoice", 14, 20);
    doc.setFontSize(12);
    doc.text(`Client: ${invoice.client}`, 14, 30);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 35);

    // Table Data
    const tableData = invoice.lineItems.map((item) => [
      item.description,
      item.type,
      `${item.GST}%`,
      item.quantity.toString(), 
      item.rate.toString(), 
      item.Amount.toString(), 
      item.CGST.toString(), 
      item.SGST.toString(), 
      item.Total.toString(),
    ]);

    // Create Table
    doc.autoTable({
      startY: 45,
      head: [
        [
          "Description",
          "Type",
          "GST",
          "Quantity",
          "Rate",
          "Amount",
          "CGST",
          "SGST",
          "Total",
        ],
      ],
      body: tableData,
    });

    // Add Totals
    doc.text(
      `Amount:     ${totalAmounts.amount}`,
      140,
      doc.autoTable.previous.finalY + 10
    );
    doc.text(
      `CGST:     ${totalAmounts.cgst}`,
      140,
      doc.autoTable.previous.finalY + 15
    );
    doc.text(
      `SGST:     ${totalAmounts.sgst}`,
      140,
      doc.autoTable.previous.finalY + 20
    );
    doc.text(
      `TOTAL (INR):     ${totalAmounts.total}`,
      140,
      doc.autoTable.previous.finalY + 30
    );

    // Save PDF
    doc.save("invoice.pdf");
  };
  const handleClose = () => {
    setError(null);
  };

  return (
    <>
      <form>
        <div id="invoiceData">
          {error && (
            <div
              id="alert-2"
              class="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <svg
                class="flex-shrink-0 w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span class="sr-only">Info</span>
              <div class="ms-3 text-sm font-medium">{error}</div>
              <button
                onClick={handleClose}
                type="button"
                class="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                data-dismiss-target="#alert-2"
                aria-label="Close"
              >
                <span class="sr-only">Close</span>
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          )}

          <div class="w-full flex items-center max-w-sm min-w-[200px]">
            <label
              class="mb-2 mr-3 text-sm text-slate-600"
              htmlFor="clientName"
            >
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              placeholder="Client Name"
              value={invoice.client}
              onChange={(e) =>
                setInvoice({ ...invoice, client: e.target.value })
              }
              className="w-64 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow-md"
            />
          </div>

          <div class="w-full flex items-center max-w-sm min-w-[200px] mt-6">
            <label
              class="mb-2 mr-3 text-sm text-slate-600"
              htmlFor="clientName"
            >
              Invoice Date
            </label>
            <input
              type="date"
              placeholder="Due Date"
              value={invoice.dueDate}
              onChange={(e) =>
                setInvoice({ ...invoice, dueDate: e.target.value })
              }
              className="w-64 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow-md"
            />
          </div>

          {/* Line Items */}
          <div className="mt-6">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="rounded-tl-lg rounded-tr-lg bg-[#733DD9]">
                  <th className="px-4 py-2 text-left col-span-2">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left col-span-1">Type</th>
                  <th className="px-4 py-2 col-span-1 text-left">GST</th>
                  <th className="px-4 py-2 col-span-2 text-left">Quantity</th>
                  <th className="px-4 py-2 col-span-3 text-left">Rate</th>
                  <th className="px-4 py-2 col-span-2 text-left">Amount</th>
                  <th className="px-4 py-2 col-span-2 text-left">CGST</th>
                  <th className="px-4 py-2  col-span-1 text-left">SGST</th>
                  <th className="px-4 py-2 col-span-1 text-left">Total</th>
                  <th className="px-4 py-2 col-span-1 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 ">
                      <input
                        type="text"
                        className="w-full focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        value={item.description}
                        placeholder="Description"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleLineItemChange(index, "type", e.target.value)
                        }
                      >
                        <option value="hours">Hours</option>
                        <option value="materials">Materials</option>
                        <option value="labor">Labor</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        onKeyDown={(event) => {
                          if (
                            event.key === "ArrowUp" ||
                            event.key === "ArrowDown"
                          ) {
                            event.preventDefault(); // Prevent the default increment/decrement
                          }
                        }}
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        value={item.GST}
                        placeholder="GST  "
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "GST",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        onKeyDown={(event) => {
                          if (
                            event.key === "ArrowUp" ||
                            event.key === "ArrowDown"
                          ) {
                            event.preventDefault(); // Prevent the default increment/decrement
                          }
                        }}
                        className="w-full focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        value={item.quantity}
                        placeholder="Quantity"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        value={item.rate}
                        placeholder="Rate"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "rate",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        disabled
                        value={item.Amount}
                        placeholder="Amount"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "Amount",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        disabled
                        value={item.CGST}
                        placeholder="CGST"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "CGST",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        disabled
                        value={item.SGST}
                        placeholder="SGST"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "SGST",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 ">
                      <input
                        type="number"
                        className="w-full  focus:outline-none border-b border-gray-300 focus:border-blue-500"
                        disabled
                        onKeyDown={(event) => {
                          if (
                            event.key === "ArrowUp" ||
                            event.key === "ArrowDown"
                          ) {
                            event.preventDefault(); // Prevent the default increment/decrement
                          }
                        }}
                        value={item.Total}
                        placeholder="Total"
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "Total",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-2 ">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              className="inline-flex justify-center mt-4 items-center leading-6 text-sm cursor-pointer outline-none font-normal rounded border border-dashed border-gray-400 h-10 px-6 whitespace-nowrap w-full bg-white text-gray-700 appearance-none"
              onClick={handleAddLineItem}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                className="mr-1"
              >
                <g id="plus-square-outline" transform="translate(-.266 .217)">
                  <g
                    id="Rectangle_1143"
                    fill="rgba(255,255,255,0)"
                    stroke="#733dd9"
                    transform="translate(.266 -.217)"
                  >
                    <rect width="16" height="16" stroke="none" rx="3"></rect>
                    <rect
                      width="15"
                      height="15"
                      x=".5"
                      y=".5"
                      fill="none"
                      rx="2.5"
                    ></rect>
                  </g>
                  <g id="Group_588" transform="translate(5.264 4.783)">
                    <path
                      id="Line_109"
                      d="M0 0L0 6"
                      stroke="#733dd9"
                      fill="none"
                      stroke-linecap="round"
                      transform="translate(3)"
                    ></path>
                    <path
                      id="Line_110"
                      d="M0 0L0 6"
                      stroke="#733dd9"
                      fill="none"
                      stroke-linecap="round"
                      transform="rotate(90 1.5 4.5)"
                    ></path>
                  </g>
                </g>
              </svg>
              <span> Add Line Item</span>
            </button>
          </div>

          <div class="w-96">
            <div class=" w-full flex items-center max-w-sm min-w-[200px] mt-6">
              <label class="mr-3">Message</label>
              <textarea
                class="peer h-full min-h-[100px] w-full resize-none rounded-md border border-gray-300 bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                placeholder="Notes "
                value={invoice.notes}
                onChange={(e) =>
                  setInvoice({ ...invoice, notes: e.target.value })
                }
              ></textarea>
            </div>
          </div>
        </div>
      </form>
      <div className="flex justify-end">
        <div className="text-right w-[40%]">
          <div className="flex justify-between my-2 min-w-0">
            <span className="block font-normal leading-6 text-base text-gray-900">
              Amount
            </span>
            <span className="block leading-6 text-base text-gray-900 font-medium">
              ₹{totalAmounts.amount}
            </span>
          </div>
          <div className="flex justify-between my-2 min-w-0">
            <span className="block font-normal leading-6 text-base text-gray-900">
              CGST
            </span>
            <span className="block leading-6 text-base text-gray-900 font-medium">
              ₹{totalAmounts.cgst}
            </span>
          </div>
          <div className="flex justify-between my-2 min-w-0">
            <span className="block font-normal leading-6 text-base text-gray-900">
              SGST
            </span>
            <span className="block leading-6 text-base text-gray-900 font-medium">
              ₹{totalAmounts.sgst}
            </span>
          </div>
          <hr class="border-t border-gray-200 border-solid h-[1px] my-2" />
          <div className="flex justify-between my-2 min-w-0">
            <span className="block font-normal leading-6 text-2xl text-gray-900 gap-3 mt-4 mb-4">
              TOTAL(INR)
            </span>
            <span className=" block leading-6 text-2xl text-gray-900 font-medium  gap-3 mt-4 mb-4">
              ₹{totalAmounts.total}
            </span>
          </div>
          <hr class="border-t border-gray-200 border-solid h-[1px] my-2" />
        </div>
      </div>
      <div className="flex justify-center mb-2">
        <button
          type="button"
          className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 mr-3"
          onClick={handleSubmit}
        >
          Save Invoice
        </button>
        <button
          type="button"
          className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          onClick={handleDownloadPDF}
        >
          Download Invoice
        </button>
      </div>
    </>
  );
}

export default InvoiceForm;
