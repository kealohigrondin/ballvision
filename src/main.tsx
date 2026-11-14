import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/app/App";
import { AppTheme } from "@/app/AppTheme";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppTheme>
      <App />
    </AppTheme>
  </React.StrictMode>,
);
