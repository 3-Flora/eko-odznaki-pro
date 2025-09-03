import { RefreshCw } from "lucide-react";
import clsx from "clsx";

export function DashboardHeader({
  name = "",
  text,
  isRefreshing = false,
  lastRefresh = null,
  onRefresh = null,
  className = "",
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
    <div
      className={clsx(
        "rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="mb-2 text-2xl font-bold">Cześć, {name}! 👋</h2>
          <p className="text-white/90">{text}</p>
        </div>
      </div>
    </div>
  );
}
