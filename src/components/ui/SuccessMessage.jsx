import { useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";

export default function SuccessMessage({ success }) {
  const { showSuccess } = useToast();

  useEffect(() => {
    if (success) {
      showSuccess(success);
    }
  }, [success, showSuccess]);

  // This component no longer renders anything - toasts are handled by ToastContainer
  return null;
}
