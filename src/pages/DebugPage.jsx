import BadgeDebug from "../components/debug/BadgeDebug";
import CountersEditor from "../components/debug/CountersEditor";
import DatabaseManager from "../components/debug/DatabaseManager";
import DatabaseViewer from "../components/debug/DatabaseViewer";

import { motion } from "framer-motion";

export default function DebugPage() {
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
      {/* Counters Editor Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CountersEditor onCountersUpdate={handleCountersUpdate} />
      </motion.div>

      {/* Database Manager Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DatabaseManager />
      </motion.div>

      {/* Database Viewer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DatabaseViewer />
      </motion.div>

      {/* Debug Section - usuń to w produkcji */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <BadgeDebug />
      </motion.div>
    </>
  );
}
