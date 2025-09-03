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

  // Mobilne: górny pasek postępu (od lewej do prawej)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Górny pasek postępu */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-transparent">
        <div
          className={clsx(
            "h-full origin-left transform transition-all duration-200",
            isReady || isRefreshing
              ? "bg-green-500"
              : "bg-gradient-to-r from-green-300 via-green-200 to-transparent dark:from-green-800",
          )}
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        />
      </div>

      {/* Opcjonalny tekst informacyjny pod paskiem */}
      {/* <div className="z-10 flex justify-center pt-3">
        <div
          className={clsx(
            "pointer-events-auto text-sm font-medium text-gray-700 transition-opacity duration-200 dark:text-gray-300",
            isPulling || isRefreshing ? "opacity-100" : "opacity-0",
          )}
        >
          {isRefreshing
            ? "Odświeżanie..."
            : isReady
              ? "Upuść, aby odświeżyć"
              : "Przeciągnij w dół"}
        </div>
      </div> */}
    </div>
  );
}
