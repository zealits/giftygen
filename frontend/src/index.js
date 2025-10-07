import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux"; 
import store from "./store"; 
// Giriraj Code
import "./i18n"; // 🔥 import i18n setup
// End Giriraj Code
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // ❌ Remove <React.StrictMode> (Only for development)
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
