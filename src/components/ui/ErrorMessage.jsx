import { useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";

export default function ErrorMessage({ error }) {
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // This component no longer renders anything - toasts are handled by ToastContainer
  return null;
}
