import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBadges } from "../../hooks/useBadges";
import BadgesStats from "../../components/badges/BadgesStats";
import PageHeader from "../../components/ui/PageHeader";

export default function BadgesPage() {
  const { currentUser } = useAuth();
  const { loading, stats, filterBadges } = useBadges(currentUser);
  const [filter, setFilter] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrowanie odznak
  const filteredBadges = filterBadges(filter);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBadge(null);
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "earned":
        return "Zdobyte odznaki";
      case "inProgress":
        return "Odznaki w trakcie";
      case "all":
      default:
        return "Wszystkie odznaki";
    }
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case "earned":
        return "Jeszcze nie zdobyłeś żadnych odznak.";
      case "inProgress":
        return "Nie masz żadnych odznak w trakcie zdobywania.";
      case "all":
      default:
        return "Brak odznak do wyświetlenia.";
    }
  };

  return (
    <>
      <PageHeader
        title="Wszystkie odznaki"
        subtitle="Przeglądaj swoje osiągnięcia i postępy"
        emoji="🏅"
      />

      <div className="">
        <BadgesStats
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
          showFilters={true}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          {getFilterTitle()}
          {loading && " (Ładowanie...)"}
        </h2>
        {/* Grid odznak w stylu Duolingo */}
        {!loading && filteredBadges.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {getEmptyMessage()}
            </p>
          </div>
        )}
        {!loading && filteredBadges.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredBadges.map((badge, index) => {
              return (
                <Badge
                  {...badge}
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                />
              );
            })}
          </div>
        )}
        {/* TODO: AKTUALIZACJA SHADOW */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-gray-200 p-4 dark:bg-gray-600"
              >
                <div className="mb-3 flex justify-center">
                  <div className="h-12 w-12 rounded-xl bg-gray-300 dark:bg-gray-500" />
                </div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-500" />
                <div className="mt-2 h-3 rounded bg-gray-300 dark:bg-gray-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal szczegółów odznaki */}
      <BadgeModal
        {...selectedBadge}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
