import { Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

/**
 * Komponent wizualny dla pull-to-refresh
 * @param {boolean} isPulling - czy użytkownik przeciąga
 * @param {boolean} isRefreshing - czy trwa odświeżanie
 * @param {number} progress - postęp 0-100%
 * @param {number} threshold - próg w pikselach
 * @param {function} onRefresh - funkcja odświeżania (dla przycisku desktop)
 */
export default function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  progress,
  threshold,
  onRefresh,
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Wykryj czy urządzenie obsługuje touch
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const isReady = progress >= 100;

  // Na desktop: pokaż przycisk gdy trwa refreshing lub gdy user może odświeżyć
  // Na mobile: pokaż tylko podczas pulling/refreshing
  const shouldShow = isTouchDevice ? isPulling || isRefreshing : true; // zawsze pokaż na desktop

  if (!shouldShow) return null;

  // Desktop button
  if (!isTouchDevice) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={clsx(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            isRefreshing
              ? "cursor-not-allowed bg-green-500 text-white"
              : "bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 active:scale-95 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-green-900 dark:hover:text-green-400",
          )}
          title="Odśwież dane"
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center justify-center pt-4">
      {/* Animowany gradient tło */}
      <div
        className={clsx(
          "absolute inset-x-0 top-0 h-24 opacity-30 transition-opacity duration-300",
          isReady || isRefreshing
            ? "bg-gradient-to-b from-green-200 to-transparent dark:from-green-900"
            : "bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700",
        )}
        style={{
          opacity: Math.min(progress / 100, 0.3),
        }}
      />

      {/* Ikona i spinner */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={clsx(
            "mb-2 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300",
            isReady || isRefreshing
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
          )}
          style={{
            transform: `scale(${Math.min(progress / 100, 1)})`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw
              className={clsx(
                "h-5 w-5 transition-transform duration-200",
                isReady && "rotate-180",
              )}
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
              }}
            />
          )}
        </div>

        {/* Pasek postępu */}
        <div className="mb-2 h-1 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={clsx(
              "h-full transition-all duration-200",
              isReady || isRefreshing
                ? "bg-green-500"
                : "bg-gray-400 dark:bg-gray-500",
            )}
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </div>

        {/* Tekst */}
        <div
          className={clsx(
            "text-sm font-medium transition-colors duration-200",
            isReady || isRefreshing
              ? "text-green-600 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400",
          )}
        >
          {isRefreshing
            ? "Odświeżanie..."
            : isReady
              ? "Upuść, aby odświeżyć"
              : "Przeciągnij w dół"}
        </div>
      </div>
    </div>
  );
}
