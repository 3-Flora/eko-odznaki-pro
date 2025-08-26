import { useEffect, useRef } from "react";

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Potwierdź akcję",
  description,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  confirmClassName = "bg-red-600 hover:bg-red-700 text-white",
  children,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xs rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-bold text-gray-800">{title}</h2>
        {description && (
          <p className="mb-4 text-sm text-gray-600">{description}</p>
        )}
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className={clsx(
              "rounded-lg px-4 py-2 text-sm",
              "bg-gray-100 hover:bg-gray-200",
            )}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            className={clsx("rounded-lg px-4 py-2 text-sm", confirmClassName)}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
