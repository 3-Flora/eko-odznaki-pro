import Badge from "../ui/Badge";
import { Award } from "lucide-react";

/**
 * Komponent wyświetlający listę odznak
 * @param {Array} badges - Lista odznak do wyświetlenia
 * @param {boolean} loading - Stan ładowania
 * @param {boolean} showAll - Czy pokazywać wszystkie odznaki
 * @param {number} maxDisplay - Maksymalna liczba odznak do wyświetlenia
 * @param {string} emptyMessage - Wiadomość gdy brak odznak
 */
export default function BadgesList({
  badges,
  loading,
  showAll = false,
  maxDisplay = 6,
  emptyMessage = "Brak odznak do wyświetlenia",
}) {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ładowanie odznak...
        </p>
      </div>
    );
  }

  const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);

  if (displayBadges.length === 0) {
    return (
      <div className="py-8 text-center">
        <Award className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {displayBadges.map((badge) => {
        // Dla zdobytych odznak, użyj ikony z aktualnego poziomu
        const currentLevelIcon = badge.currentLevelData?.icon || "🏅";
        // Dla niezdobytych, użyj ikony pierwszego poziomu
        const nextLevelIcon = badge.nextLevelData?.icon || "🏅";
        const displayIcon = badge.isEarned ? currentLevelIcon : nextLevelIcon;

        return (
          <Badge
            key={badge.id}
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
            badgeImage={badge.badgeImage || ""}
          />
        );
      })}
    </div>
  );
}
