import React from "react";
import InvoiceForm from "./components/InvoiceForm.js";
import InvoiceList from "./components/InvoiceList.js";

import { ThemeProvider } from '@material-tailwind/react';

function App() {
  return (
    <ThemeProvider>

    <div className="bg-gray-300 min-h-screen flex items-center flex-col">
      <h1 className=" text-[36px] tracking-[-1px] leading-[1.2] text-center mb-6 mt-6">
        Create Online Invoice in Less Than 2 Minutes
      </h1>
      <div className="bg-white mx-auto p-4 max-w-screen-lg relative max-w-[1024px] w-full mx-auto rounded-[10px]">
        <InvoiceForm />
        <InvoiceList />
      </div>
    </div>
    </ThemeProvider>
  );
}

export default App;
