import clsx from "clsx";
import { useDeviceEnvironment } from "../../contexts/DeviceEnvironmentContext";
import { useToast } from "../../contexts/ToastContext";
import Toast from "./Toast";

export default function ToastContainer() {
  const { toasts } = useToast();
  const { mobileDeviceType } = useDeviceEnvironment();

  if (toasts.length === 0) return null;

  return (
    <div
      className={clsx(
        "pointer-events-none fixed inset-x-0 top-0 z-5 p-4 pt-16",
        {
          "mt-5": mobileDeviceType === "Android",
          "mt-safe": mobileDeviceType === "iPhone",
        },
      )}
    >
      <div className="mx-auto w-full max-w-md space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
