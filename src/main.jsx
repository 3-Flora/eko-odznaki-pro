import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import DeviceEnvironmentProvider from "./contexts/DeviceEnvironmentContext";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { LimitsRefreshProvider } from "./contexts/LimitsRefreshContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceEnvironmentProvider>
        <LimitsRefreshProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </LimitsRefreshProvider>
      </DeviceEnvironmentProvider>
    </ThemeProvider>
  </StrictMode>,
);
