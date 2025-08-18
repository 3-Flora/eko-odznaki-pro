import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import DeviceEnvironmentProvider from "./contexts/DeviceEnvironmentContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceEnvironmentProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DeviceEnvironmentProvider>
    </ThemeProvider>
  </StrictMode>,
);
