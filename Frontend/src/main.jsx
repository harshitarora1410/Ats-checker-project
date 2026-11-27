import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AnalysisDraftProvider } from "./context/AnalysisDraftContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnalysisDraftProvider>
          <App />
        </AnalysisDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
