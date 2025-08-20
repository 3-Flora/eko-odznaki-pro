import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { Capacitor } from "@capacitor/core";

const DeviceEnvironmentContext = createContext();

export const useDeviceEnvironment = () => useContext(DeviceEnvironmentContext);

export default function DeviceEnvironmentProvider({ children }) {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    if (
      (typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          // Safari
          ("standalone" in window.navigator && window.navigator.standalone))) ||
      Capacitor.isNativePlatform()
    ) {
      setIsPWA(true);
    } else setIsPWA(false);
  }, []);

  const mobileDeviceType = useMemo(() => {
    if (isPWA) {
      return Capacitor.getPlatform() === "android" ? "Android" : "iPhone";
    }
  }, [isPWA]);

  return (
    <DeviceEnvironmentContext.Provider value={{ isPWA, mobileDeviceType }}>
      {children}
    </DeviceEnvironmentContext.Provider>
  );
}
