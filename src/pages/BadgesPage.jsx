import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Trophy, Star, Target } from "lucide-react";
import {
  getBadgeTemplates,
  calculateBadgeProgress,
} from "../services/badgeService";
import Badge from "../components/ui/Badge";
import BackButton from "../components/ui/BackButton";
import clsx from "clsx";

export default function BadgesPage() {
  const { currentUser } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, earned, inProgress

  // Pobierz postęp odznak z bazy danych
  useEffect(() => {
    const loadBadgeProgress = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const badgeTemplates = await getBadgeTemplates();
        const progress = calculateBadgeProgress(
          currentUser.counters || {},
          currentUser.earnedBadges || {},
          badgeTemplates,
        );
        setBadgeProgress(progress);
      } catch (error) {
        console.error("Error loading badge progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBadgeProgress();
  }, [currentUser]);

  // Filtrowanie odznak
  const filteredBadges = badgeProgress.filter((badge) => {
    switch (filter) {
      case "earned":
        return badge.isEarned;
      case "inProgress":
        return !badge.isEarned && badge.currentCount > 0;
      case "all":
      default:
        return true;
    }
  });

  // Statystyki
  const earnedCount = badgeProgress.filter((badge) => badge.isEarned).length;
  const inProgressCount = badgeProgress.filter(
    (badge) => !badge.isEarned && badge.currentCount > 0,
  ).length;
  const totalCount = badgeProgress.length;

  const stats = [
    {
      label: "Zdobyte",
      value: earnedCount,
      icon: Trophy,
      color: "text-yellow-600",
      filter: "earned",
    },
    {
      label: "W trakcie",
      value: inProgressCount,
      icon: Target,
      color: "text-blue-600",
      filter: "inProgress",
    },
    {
      label: "Wszystkie",
      value: totalCount,
      icon: Star,
      color: "text-purple-600",
      filter: "all",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Wszystkie odznaki
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Przeglądaj swoje osiągnięcia i postępy
          </p>
        </div>
      </div>
      <div className="mb-0 grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filter)}
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
      {/* Badges Grid */}
      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          {filter === "earned" && "Zdobyte odznaki"}
          {filter === "inProgress" && "Odznaki w trakcie"}
          {filter === "all" && "Wszystkie odznaki"}
          {loading && " (Ładowanie...)"}
        </h2>

        {!loading && filteredBadges.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "earned" && "Jeszcze nie zdobyłeś żadnych odznak."}
              {filter === "inProgress" &&
                "Nie masz żadnych odznak w trakcie zdobywania."}
              {filter === "all" && "Brak odznak do wyświetlenia."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBadges.map((badge, index) => {
            // Dla zdobytych odznak, użyj ikony z aktualnego poziomu
            const currentLevelIcon = badge.currentLevelData?.icon || "🏅";
            // Dla niezdobytych, użyj ikony pierwszego poziomu
            const nextLevelIcon = badge.nextLevelData?.icon || "🏅";
            const displayIcon = badge.isEarned
              ? currentLevelIcon
              : nextLevelIcon;

            return (
              <div key={badge.id}>
                <Badge
                  icon={displayIcon}
                  name={badge.name}
                  description={
                    badge.isEarned
                      ? badge.currentLevelData?.description
                      : badge.nextLevelData?.description
                  }
                  color="bg-green-500"
                  lvl={badge.currentLevel}
                  progress={badge.progress}
                  progressText={badge.progressText}
                  nextLevelData={badge.nextLevelData}
                  isEarned={badge.isEarned}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
