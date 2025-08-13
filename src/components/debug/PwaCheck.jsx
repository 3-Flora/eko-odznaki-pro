import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";

export default function PwaCheck() {
  const { isPWA, mobileDeviceType } = useDeviceEnvironment();
  return (
    <div className="fixed bottom-0 left-0 bg-gray-800 p-2 text-white">
      <p>PWA: {isPWA ? "Yes" : "No"}</p>
      <p>Mobile Type: {mobileDeviceType}</p>
    </div>
  );
}
