import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import DeviceEnvironmentProvider from "./contexts/DeviceEnvironmentContext";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceEnvironmentProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </DeviceEnvironmentProvider>
    </ThemeProvider>
  </StrictMode>,
);
