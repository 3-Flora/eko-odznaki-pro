import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { Capacitor } from "@capacitor/core";

const DeviceEnvironmentContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

  function isIPhoneSE23() {
    return window.matchMedia(
      "only screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
    ).matches;
  }

  const mobileDeviceType = useMemo(() => {
    if (isPWA) {
      // iPhone SE 2023 has a different top padding
      return isIPhoneSE23() || Capacitor.getPlatform() === "android"
        ? "SEorAndroid"
        : "notch";
    }
  }, [isPWA]);

  return (
    <DeviceEnvironmentContext.Provider value={{ isPWA, mobileDeviceType }}>
      {children}
    </DeviceEnvironmentContext.Provider>
  );
}
