import { Trophy, Star, Target } from "lucide-react";
import clsx from "clsx";

/**
 * Komponent wyświetlający statystyki odznak
 * @param {Object} stats - Statystyki odznak (earned, inProgress, total)
 * @param {string} filter - Aktualny filtr
 * @param {Function} onFilterChange - Funkcja zmiany filtra
 * @param {boolean} showFilters - Czy pokazywać filtry jako przyciski
 */
export default function BadgesStats({
  stats,
  filter,
  onFilterChange,
  showFilters = true,
}) {
  const statItems = [
    {
      label: "Zdobyte",
      value: stats.earned,
      icon: Trophy,
      color: "text-yellow-600",
      filter: "earned",
    },
    {
      label: "W trakcie",
      value: stats.inProgress,
      icon: Target,
      color: "text-blue-600",
      filter: "inProgress",
    },
    {
      label: "Wszystkie",
      value: stats.total,
      icon: Star,
      color: "text-purple-600",
      filter: "all",
    },
  ];

  if (!showFilters) {
    // Tylko wyświetlanie statystyk bez filtrów
    return (
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-gray-800"
          >
            <stat.icon className={clsx("mx-auto mb-2 h-6 w-6", stat.color)} />
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {statItems.map((stat) => (
        <button
          key={stat.label}
          onClick={() => onFilterChange?.(stat.filter)}
          className={clsx(
            "rounded-2xl p-4 text-center shadow-lg transition-all",
            filter === stat.filter
              ? "bg-green-500 text-white dark:bg-green-600"
              : "bg-white dark:bg-gray-800",
          )}
        >
          <stat.icon
            className={clsx(
              "mx-auto mb-2 h-8 w-8",
              filter === stat.filter ? "text-white" : stat.color,
            )}
          />
          <p
            className={clsx(
              "text-2xl font-bold",
              filter === stat.filter
                ? "text-white"
                : "text-gray-800 dark:text-white",
            )}
          >
            {stat.value}
          </p>
          <p
            className={clsx(
              "text-sm",
              filter === stat.filter
                ? "text-green-100"
                : "text-gray-600 dark:text-gray-300",
            )}
          >
            {stat.label}
          </p>
        </button>
      ))}
    </div>
  );
}
