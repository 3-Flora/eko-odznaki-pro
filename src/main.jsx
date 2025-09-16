import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext.jsx";
import DeviceEnvironmentProvider from "./contexts/DeviceEnvironmentContext";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { LimitsRefreshProvider } from "./contexts/LimitsRefreshContext.jsx";
import { RefreshProvider } from "./contexts/RefreshContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceEnvironmentProvider>
        <LimitsRefreshProvider>
          <AuthProvider>
            <SidebarProvider>
              <NotificationProvider>
                <ToastProvider>
                  <RefreshProvider>
                    <App />
                  </RefreshProvider>
                </ToastProvider>
              </NotificationProvider>
            </SidebarProvider>
          </AuthProvider>
        </LimitsRefreshProvider>
      </DeviceEnvironmentProvider>
    </ThemeProvider>
  </StrictMode>,
);
