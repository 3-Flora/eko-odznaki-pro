import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
} from "../services/notificationService";

// Cache dla powiadomień użytkownika
const notificationsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

/**
 * Hook do zarządzania powiadomieniami użytkownika
 */
export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Memoizowane wartości pochodne
  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.isRead).length;

    return count;
  }, [notifications]);

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  /**
   * Sprawdza czy cache jest aktualny
   */
  const isCacheValid = useCallback((userId) => {
    const cacheKey = `notifications_${userId}`;
    const cached = notificationsCache.get(cacheKey);

    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < CACHE_DURATION;
  }, []);

  /**
   * Pobiera powiadomienia z cache lub z serwera
   */
  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!currentUser) {
        setNotifications([]);
        return;
      }

      const cacheKey = `notifications_${currentUser.id}`;

      // Sprawdź cache jeśli nie wymuszamy odświeżenia
      if (!forceRefresh && isCacheValid(currentUser.id)) {
        const cached = notificationsCache.get(cacheKey);
        setNotifications(cached.data);
        setLastFetchTime(cached.timestamp);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userNotifications = await getUserNotifications(
          currentUser.id,
          currentUser.role,
          currentUser.schoolId,
          currentUser.classId,
          30, // Zmniejszamy limit dla lepszej wydajności
        );

        setNotifications(userNotifications);

        // Zapisz do cache
        const timestamp = Date.now();
        notificationsCache.set(cacheKey, {
          data: userNotifications,
          timestamp,
        });
        setLastFetchTime(timestamp);
      } catch (err) {
        console.error("❌ Błąd podczas pobierania powiadomień:", err);
        setError("Nie udało się pobrać powiadomień");
      } finally {
        setLoading(false);
      }
    },
    [currentUser, isCacheValid],
  );

  /**
   * Oznacza powiadomienie jako przeczytane
   */
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!currentUser) return;

      try {
        await markNotificationAsRead(notificationId, currentUser.id);

        // Aktualizuj lokalny stan
        setNotifications((prev) => {
          const updated = prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          );

          return updated;
        });

        // Wyczyść cache żeby wymusić odświeżenie
        const cacheKey = `notifications_${currentUser.id}`;
        notificationsCache.delete(cacheKey);
      } catch (err) {
        console.error(
          "❌ Błąd podczas oznaczania powiadomienia jako przeczytane:",
          err,
        );
        setError("Nie udało się oznaczyć powiadomienia jako przeczytane");
      }
    },
    [currentUser],
  );

  /**
   * Oznacza wszystkie powiadomienia jako przeczytane
   */
  const markAllAsRead = useCallback(async () => {
    if (!currentUser) return;

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      const unreadIds = unreadNotifications.map((n) => n.id);
      await markMultipleNotificationsAsRead(unreadIds, currentUser.id);

      // Aktualizuj lokalny stan
      setNotifications((prev) => {
        const updated = prev.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        return updated;
      });

      // Wyczyść cache żeby wymusić odświeżenie
      const cacheKey = `notifications_${currentUser.id}`;
      notificationsCache.delete(cacheKey);
    } catch (err) {
      console.error(
        "❌ Błąd podczas oznaczania wszystkich powiadomień jako przeczytane:",
        err,
      );
      setError(
        "Nie udało się oznaczyć wszystkich powiadomień jako przeczytane",
      );
    }
  }, [notifications, currentUser]);

  /**
   * Filtruje powiadomienia według typu
   */
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notification) => notification.type === type);
    },
    [notifications],
  );

  /**
   * Pobiera tylko nieprzeczytane powiadomienia
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notification) => !notification.isRead);
  }, [notifications]);

  /**
   * Pobiera najnowsze powiadomienia (limit)
   */
  const getRecentNotifications = useCallback(
    (limit = 5) => {
      return notifications.slice(0, limit);
    },
    [notifications],
  );

  /**
   * Czyści cache powiadomień (użyteczne przy wylogowaniu)
   */
  const clearCache = useCallback(() => {
    if (currentUser) {
      const cacheKey = `notifications_${currentUser.id}`;
      notificationsCache.delete(cacheKey);
    }
  }, [currentUser]);

  // Efekt do automatycznego pobierania powiadomień
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Automatyczne odświeżanie co 10 minut jeśli użytkownik jest aktywny
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(
      () => {
        // Sprawdź czy cache wygasł
        if (!isCacheValid(currentUser.id)) {
          fetchNotifications();
        }
      },
      10 * 60 * 1000,
    ); // 10 minut

    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications, isCacheValid]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    lastFetchTime,
    recentNotifications,

    // Akcje
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearCache,

    // Pomocnicze funkcje
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
  };
};

export default useNotifications;
