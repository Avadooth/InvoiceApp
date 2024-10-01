import React from "react";
// import { StrictMode } from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import App from "./App.js";
import 'tailwindcss/tailwind.css'; 

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
</React.StrictMode>
);
