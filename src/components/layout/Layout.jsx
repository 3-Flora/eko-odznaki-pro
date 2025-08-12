import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import { Outlet } from "react-router";

export default function Layout() {
  const { mobileDeviceType } = useDeviceEnvironment();

  return (
    <main
      className={`flex flex-col min-h-screen bg-gray-50 ${
        mobileDeviceType === "SEorAndroid" && "pt-11"
      } ${mobileDeviceType === "notch" && "pt-18"}`}
    >
      <Navbar />
      <main className="flex-1 py-16 overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </main>
  );
}
