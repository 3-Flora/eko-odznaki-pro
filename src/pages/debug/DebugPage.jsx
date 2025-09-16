import BadgeDebug from "../../components/debug/BadgeDebug";
import CountersEditor from "../../components/debug/CountersEditor";
import DatabaseManager from "../../components/debug/DatabaseManager";
import DatabaseViewer from "../../components/debug/DatabaseViewer";
import SubmissionsManager from "../../components/debug/SubmissionsManager";
import ClassFeedDebug from "../../components/debug/ClassFeedDebug";
import NotificationDebug from "../../components/debug/NotificationDebug";

import {
  calculateBadgeProgress,
  getBadgeTemplates,
  getRecentBadgesForProfile,
} from "../../services/badgeService";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function DebugPage() {
  const { currentUser } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState({});
  const [recentBadges, setRecentBadges] = useState([]);

  // Funkcja do odświeżania odznak po zmianie counters
  const handleCountersUpdate = async (newCounters) => {
    // Odśwież postęp odznak z nowymi counters
    try {
      const badgeTemplates = await getBadgeTemplates();
      const progress = calculateBadgeProgress(
        newCounters,
        currentUser.earnedBadges || {},
        badgeTemplates,
      );
      setBadgeProgress(progress);

      const recent = getRecentBadgesForProfile(
        progress,
        currentUser.earnedBadges || {},
      );
      setRecentBadges(recent);
    } catch (error) {
      console.error("Error refreshing badge progress:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🛠️ Panel debugowania
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Narzędzia do zarządzania i debugowania aplikacji EkoOdznaki
          </p>
        </div>

        {/* Grid layout dla komponentów */}
        <div className="space-y-8">
          {/* Sekcja zarządzania użytkownikami */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              👤 Zarządzanie użytkownikami
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CountersEditor onCountersUpdate={handleCountersUpdate} />
              <BadgeDebug />
            </div>
          </section>

          {/* Sekcja zarządzania danymi */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              💾 Zarządzanie bazą danych
            </h2>
            <div className="space-y-6">
              <DatabaseManager />
              <SubmissionsManager />
            </div>
          </section>

          {/* Sekcja podglądu danych */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              🔍 Podgląd danych
            </h2>
            <DatabaseViewer />
          </section>

          {/* Sekcja powiadomień i feedu */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              📢 Komunikacja
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ClassFeedDebug />
              <NotificationDebug />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
