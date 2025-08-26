import BadgeDebug from "../components/debug/BadgeDebug";
import CountersEditor from "../components/debug/CountersEditor";
import DatabaseManager from "../components/debug/DatabaseManager";
import DatabaseViewer from "../components/debug/DatabaseViewer";

import {
  calculateBadgeProgress,
  getBadgeTemplates,
} from "../services/badgeService";
import { useAuth } from "../contexts/AuthContext";

export default function DebugPage() {
  const { currentUser } = useAuth();

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
    <>
      <CountersEditor onCountersUpdate={handleCountersUpdate} />
      <DatabaseManager />
      <DatabaseViewer />
      <BadgeDebug />
    </>
  );
}
