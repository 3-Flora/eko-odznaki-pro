import BadgeDebug from "../components/debug/BadgeDebug";
import CountersEditor from "../components/debug/CountersEditor";
import DatabaseManager from "../components/debug/DatabaseManager";
import DatabaseViewer from "../components/debug/DatabaseViewer";
import ClassFeedDebug from "../components/debug/ClassFeedDebug";

import {
  calculateBadgeProgress,
  getBadgeTemplates,
  getRecentBadgesForProfile,
} from "../services/badgeService";
import { useAuth } from "../contexts/AuthContext";
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
    <>
      <CountersEditor onCountersUpdate={handleCountersUpdate} />
      <ClassFeedDebug />
      <DatabaseManager />
      <DatabaseViewer />
      <BadgeDebug />
    </>
  );
}
