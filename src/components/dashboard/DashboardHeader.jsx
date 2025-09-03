import { RefreshCw } from "lucide-react";
import clsx from "clsx";

export function DashboardHeader({
  name = "",
  text,
  isRefreshing = false,
  lastRefresh = null,
  onRefresh = null,
}) {
  const formatLastRefresh = (timestamp) => {
    if (!timestamp) return null;

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Przed chwilą";
    if (minutes < 60) return `${minutes} min temu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} godz. temu`;

    return "Wczoraj lub wcześniej";
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="mb-2 text-2xl font-bold">Cześć, {name}! 👋</h2>
          <p className="text-white/90">{text}</p>

          {lastRefresh && (
            <p className="mt-2 text-xs text-white/70">
              Dane z cache • {formatLastRefresh(lastRefresh)}
            </p>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={clsx(
              "ml-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
              isRefreshing
                ? "cursor-not-allowed bg-white/20"
                : "bg-white/20 hover:bg-white/30 active:scale-95",
            )}
            title="Odśwież dane"
          >
            <RefreshCw
              className={clsx("h-5 w-5 text-white", {
                "animate-spin": isRefreshing,
              })}
            />
          </button>
        )}
      </div>
    </div>
  );
}
