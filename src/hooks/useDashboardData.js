import { useEffect, useState, useCallback, useMemo } from "react";
import { getActiveEcoChallenge } from "../services/ecoChallengeService";
import { getLimitedEcoActions } from "../services/ecoActionService";
import {
  getTeacherClassStats,
  getPendingVerifications,
} from "../services/teacherService";

// Cache konfiguracja
const CACHE_TTL = 5 * 60 * 1000; // 5 minut
const dashboardCache = new Map();

/**
 * Hook do zarządzania danymi dashboardu z cache i pull-to-refresh
 */
export default function useDashboardData(currentUser) {
  const [data, setData] = useState({
    ecoChallenge: null,
    ecoActions: [],
    teacherStats: null,
    pendingVerifications: null,
  });

  const [loading, setLoading] = useState({
    ecoChallenge: false,
    ecoActions: false,
    teacher: false,
  });

  const [errors, setErrors] = useState({
    ecoChallenge: null,
    ecoActions: null,
    teacher: null,
  });

  const [lastRefresh, setLastRefresh] = useState(null);

  const isTeacher = useMemo(
    () => currentUser?.role === "teacher",
    [currentUser?.role],
  );

  const isEkoskop = useMemo(
    () => currentUser?.role === "ekoskop",
    [currentUser?.role],
  );

  // Funkcje cache
  const getCacheKey = useCallback((type, userId, classId) => {
    return `dashboard_${type}_${userId}_${classId || "no-class"}`;
  }, []);

  const getCachedData = useCallback((key) => {
    const cached = dashboardCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      dashboardCache.delete(key);
      return null;
    }

    return cached.data;
  }, []);

  const setCachedData = useCallback((key, data) => {
    const timestamp = Date.now();
    dashboardCache.set(key, {
      data,
      timestamp,
    });
    setLastRefresh(timestamp);
  }, []);

  // Funkcja do pobierania danych z cache lub API
  const fetchEcoChallenge = useCallback(
    async (forceRefresh = false) => {
      if (!currentUser?.classId || isTeacher) return;

      const cacheKey = getCacheKey(
        "ecoChallenge",
        currentUser.id,
        currentUser.classId,
      );

      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
          setData((prev) => ({ ...prev, ecoChallenge: cached }));
          // Ustaw timestamp ostatniego odświeżenia z cache
          const cacheEntry = dashboardCache.get(cacheKey);
          if (cacheEntry) {
            setLastRefresh(cacheEntry.timestamp);
          }
          return;
        }
      }

      setLoading((prev) => ({ ...prev, ecoChallenge: true }));
      setErrors((prev) => ({ ...prev, ecoChallenge: null }));

      try {
        const result = await getActiveEcoChallenge();
        setData((prev) => ({ ...prev, ecoChallenge: result }));
        setCachedData(cacheKey, result);
      } catch (error) {
        console.error("Error fetching eco challenge:", error);
        setErrors((prev) => ({ ...prev, ecoChallenge: error }));
      } finally {
        setLoading((prev) => ({ ...prev, ecoChallenge: false }));
      }
    },
    [currentUser, isTeacher, getCacheKey, getCachedData, setCachedData],
  );

  const fetchEcoActions = useCallback(
    async (forceRefresh = false) => {
      if (isTeacher) return;

      const cacheKey = getCacheKey("ecoActions", currentUser?.id, "global");

      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
          setData((prev) => ({ ...prev, ecoActions: cached }));
          // Ustaw timestamp ostatniego odświeżenia z cache
          const cacheEntry = dashboardCache.get(cacheKey);
          if (cacheEntry) {
            setLastRefresh(cacheEntry.timestamp);
          }
          return;
        }
      }

      setLoading((prev) => ({ ...prev, ecoActions: true }));
      setErrors((prev) => ({ ...prev, ecoActions: null }));

      try {
        const result = await getLimitedEcoActions(3);
        setData((prev) => ({ ...prev, ecoActions: result || [] }));
        setCachedData(cacheKey, result || []);
      } catch (error) {
        console.error("Error fetching eco actions:", error);
        setErrors((prev) => ({ ...prev, ecoActions: error }));
      } finally {
        setLoading((prev) => ({ ...prev, ecoActions: false }));
      }
    },
    [currentUser, isTeacher, getCacheKey, getCachedData, setCachedData],
  );

  const fetchTeacherData = useCallback(
    async (forceRefresh = false) => {
      if (!isTeacher || !currentUser?.classId) return;

      const cacheKey = getCacheKey(
        "teacher",
        currentUser.id,
        currentUser.classId,
      );

      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
          setData((prev) => ({
            ...prev,
            teacherStats: cached.stats,
            pendingVerifications: cached.pendingVerifications,
          }));
          // Ustaw timestamp ostatniego odświeżenia z cache
          const cacheEntry = dashboardCache.get(cacheKey);
          if (cacheEntry) {
            setLastRefresh(cacheEntry.timestamp);
          }
          return;
        }
      }

      setLoading((prev) => ({ ...prev, teacher: true }));
      setErrors((prev) => ({ ...prev, teacher: null }));

      try {
        const [stats, pendingVerifications] = await Promise.all([
          getTeacherClassStats(currentUser.classId),
          getPendingVerifications(currentUser.classId),
        ]);

        const teacherData = { stats, pendingVerifications };
        setData((prev) => ({
          ...prev,
          teacherStats: stats,
          pendingVerifications: pendingVerifications,
        }));
        setCachedData(cacheKey, teacherData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setErrors((prev) => ({ ...prev, teacher: error }));
      } finally {
        setLoading((prev) => ({ ...prev, teacher: false }));
      }
    },
    [currentUser, isTeacher, getCacheKey, getCachedData, setCachedData],
  );

  // Funkcja odświeżania wszystkich danych
  const refreshAll = useCallback(async () => {
    const promises = [];

    if (!isTeacher && currentUser?.classId) {
      promises.push(fetchEcoChallenge(true));
    }

    if (!isTeacher) {
      promises.push(fetchEcoActions(true));
    }

    if (isTeacher && currentUser?.classId) {
      promises.push(fetchTeacherData(true));
    }

    await Promise.all(promises);
  }, [
    isTeacher,
    currentUser,
    fetchEcoChallenge,
    fetchEcoActions,
    fetchTeacherData,
  ]);

  // Inicjalne ładowanie danych
  useEffect(() => {
    if (!currentUser) return;

    fetchEcoChallenge();
    fetchEcoActions();
    fetchTeacherData();
  }, [currentUser, fetchEcoChallenge, fetchEcoActions, fetchTeacherData]);

  // Funkcja do czyszczenia cache (opcjonalna)
  const clearCache = useCallback(() => {
    dashboardCache.clear();
  }, []);

  const isAnyLoading =
    loading.ecoChallenge || loading.ecoActions || loading.teacher;

  return {
    data,
    loading,
    errors,
    isAnyLoading,
    lastRefresh,
    refreshAll,
    clearCache,
    isTeacher,
    isEkoskop,
  };
}
