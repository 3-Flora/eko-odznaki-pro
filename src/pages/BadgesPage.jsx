import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBadges } from "../hooks/useBadges";
import BadgesStats from "../components/badges/BadgesStats";
import BadgesList from "../components/badges/BadgesList";
import PageHeader from "../components/ui/PageHeader";

export default function BadgesPage() {
  const { currentUser } = useAuth();
  const { loading, stats, filterBadges } = useBadges(currentUser);
  const [filter, setFilter] = useState("all");

  // Filtrowanie odznak
  const filteredBadges = filterBadges(filter);

  console.log("FilteredBadges: ", filteredBadges);

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

        <BadgesList
          badges={filteredBadges}
          loading={loading}
          showAll={true}
          emptyMessage={getEmptyMessage()}
        />
      </div>
    </>
  );
}
