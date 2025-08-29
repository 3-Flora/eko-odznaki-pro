import { useState, useEffect } from "react";
import {
  getBadgeTemplates,
  calculateBadgeProgress,
} from "../services/badgeService";

/**
 * Hook do zarządzania odznakamii użytkownika
 * @param {Object} user - Obiekt użytkownika z counters i earnedBadges
 * @returns {Object} - Stan odznak, statystyki i funkcje pomocnicze
 */
export function useBadges(user) {
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBadgeProgress = async () => {
      if (!user) {
        setBadgeProgress([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const badgeTemplates = await getBadgeTemplates();
        const progress = calculateBadgeProgress(
          user.counters || {},
          user.earnedBadges || {},
          badgeTemplates,
        );
        setBadgeProgress(progress);
      } catch (err) {
        console.error("Error loading badge progress:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadBadgeProgress();
  }, [user]);

  // Statystyki odznak
  const earnedCount = badgeProgress.filter((badge) => badge.isEarned).length;
  const inProgressCount = badgeProgress.filter(
    (badge) => !badge.isEarned && badge.currentCount > 0,
  ).length;
  const totalCount = badgeProgress.length;

  // Tylko zdobyte odznaki
  const earnedBadges = badgeProgress.filter((badge) => badge.isEarned);

  // Odznaki w trakcie zdobywania
  const inProgressBadges = badgeProgress.filter(
    (badge) => !badge.isEarned && badge.currentCount > 0,
  );

  // Filtrowanie odznak
  const filterBadges = (filter) => {
    switch (filter) {
      case "earned":
        return earnedBadges;
      case "inProgress":
        return inProgressBadges;
      case "all":
      default:
        return badgeProgress;
    }
  };

  return {
    badgeProgress,
    loading,
    error,
    stats: {
      earned: earnedCount,
      inProgress: inProgressCount,
      total: totalCount,
    },
    earnedBadges,
    inProgressBadges,
    filterBadges,
  };
}
