import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>

      <AuthProvider>
          <SocketProvider>
           <App />
          </SocketProvider>
      </AuthProvider>

    </BrowserRouter>
  </StrictMode>
);
