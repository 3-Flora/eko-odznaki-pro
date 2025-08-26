import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { useToast } from "../../contexts/ToastContext";

const toastTypes = {
  error: {
    icon: AlertCircle,
    className:
      "border-red-400 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300",
  },
  success: {
    icon: CheckCircle,
    className:
      "border-green-400 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-300",
  },
  info: {
    icon: Info,
    className:
      "border-blue-400 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-yellow-400 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
};

export default function Toast({ toast }) {
  const [isVisible, setIsVisible] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { removeToast } = useToast();

  const { icon: Icon, className } = toastTypes[toast.type] || toastTypes.error;

  useEffect(() => {
    // Show animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar effect
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0 || isPaused || isClosing) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / toast.duration) * 100; // Update every 100ms
        const newProgress = prev - decrement;

        if (newProgress <= 0) {
          // Start closing process
          setIsClosing(true);
          return 0;
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toast.duration, isPaused, isClosing]);

  // Handle closing animation and removal
  useEffect(() => {
    if (isClosing) {
      setIsVisible(false);
      const timer = setTimeout(() => removeToast(toast.id), 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing, removeToast, toast.id]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const deltaY = startY - touchY;

    if (deltaY > 0) {
      // Only allow upward drag
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (currentY > 50) {
      // If dragged up more than 50px, dismiss
      handleClose();
    } else {
      setCurrentY(0); // Snap back
    }
  };

  const handleMouseDown = (e) => {
    setStartY(e.clientY);
    setCurrentY(0);
    setIsDragging(true);

    const handleMouseMove = (e) => {
      const deltaY = startY - e.clientY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (currentY > 50) {
        handleClose();
      } else {
        setCurrentY(0);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto relative mb-2 overflow-hidden rounded-xl border shadow-lg transition-all duration-300",
        className,
        {
          "translate-y-0 opacity-100": isVisible,
          "-translate-y-full opacity-0": !isVisible,
        },
      )}
      style={{
        transform: `translateY(${isVisible ? -currentY : -100}px)`,
        opacity: isVisible ? Math.max(0.3, 1 - currentY / 100) : 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex cursor-pointer items-start gap-3 px-4 py-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="ml-2 flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10 dark:bg-white/10">
          <div
            className={clsx("h-full transition-all duration-100 ease-linear", {
              "bg-red-500": toast.type === "error",
              "bg-green-500": toast.type === "success",
              "bg-blue-500": toast.type === "info",
              "bg-yellow-500": toast.type === "warning",
            })}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// // Progress bar effect
// useEffect(() => {
//     // Jeśli czas trwania nie jest ustawiony, jest mniejszy lub równy 0,
//     // pasek jest wstrzymany lub toast jest w trakcie zamykania, nie rób nic.
//     if (!toast.duration || toast.duration <= 0 || isPaused || isClosing) return;

//     // Ustaw interwał, który będzie aktualizował postęp co 100ms
//     const interval = setInterval(() => {
//         setProgress((prev) => {
//             // Oblicz, ile procent paska powinno zostać zmniejszone w każdym kroku
//             const decrement = (100 / toast.duration) * 100; // Aktualizacja co 100ms
//             const newProgress = prev - decrement;

//             // Jeśli postęp osiągnie 0 lub mniej, rozpocznij proces zamykania
//             if (newProgress <= 0) {
//                 setIsClosing(true); // Ustaw flagę zamykania
//                 return 0; // Ustaw postęp na 0
//             }

//             return newProgress; // Zaktualizuj postęp
//         });
//     }, 100);

//     // Wyczyść interwał, gdy komponent zostanie odmontowany lub warunki się zmienią
//     return () => clearInterval(interval);
// }, [toast.duration, isPaused, isClosing]);
