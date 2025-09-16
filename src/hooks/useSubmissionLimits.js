import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLimitsRefresh } from "../contexts/LimitsRefreshContext";
import {
  validateSubmissionLimits,
  validateWeeklyChallengeLimit,
  getUserSubmissionStats,
} from "../services/submissionLimitService";

/**
 * Hook do sprawdzania limitów zgłoszeń dla konkretnej aktywności
 * @param {Object} activity - Dane aktywności (EkoDziałanie lub EkoWyzwanie)
 * @param {string} type - Typ aktywności ("eco_action" lub "challenge")
 * @param {boolean} enabled - Czy hook ma być aktywny
 * @returns {Object} - Stan limitów i funkcje do ich sprawdzania
 */
export const useSubmissionLimits = (activity, type, enabled = true) => {
  const { currentUser } = useAuth();
  const { refreshTrigger, shouldRefreshLimits } = useLimitsRefresh();

  console.log("useSubmissionLimits: hook initialized", {
    userId: currentUser?.id,
    activityId: activity?.id,
    type,
    enabled,
  });
  const [limitData, setLimitData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const lastRefreshTriggerRef = useRef(-1); // Inicjalizuj na -1, żeby pierwsze sprawdzenie działało

  // Funkcja do sprawdzania limitów
  const checkLimits = useCallback(async () => {
    if (!enabled || !currentUser?.id || !activity?.id) {
      console.log("useSubmissionLimits: skipping check", {
        enabled,
        userId: currentUser?.id,
        activityId: activity?.id,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("useSubmissionLimits: checking limits for", {
        userId: currentUser.id,
        activityId: activity.id,
        type,
      });

      const [limitValidation, submissionStats, challengeValidation] =
        await Promise.all([
          validateSubmissionLimits(currentUser.id, activity.id, type, activity),
          getUserSubmissionStats(currentUser.id, activity.id, type),
          type === "challenge"
            ? validateWeeklyChallengeLimit(currentUser.id)
            : Promise.resolve(null),
        ]);

      console.log("useSubmissionLimits: results", {
        limitValidation,
        submissionStats,
        challengeValidation,
      });

      setLimitData({
        ...limitValidation,
        challengeLimit: challengeValidation,
      });
      setStats(submissionStats);
      lastRefreshTriggerRef.current = refreshTrigger;
    } catch (err) {
      console.error("Error checking submission limits:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled, currentUser?.id, activity?.id, type, refreshTrigger]);

  // Sprawdź limity przy pierwszym ładowaniu
  useEffect(() => {
    console.log("useSubmissionLimits: first load useEffect", {
      enabled,
      userId: currentUser?.id,
      activityId: activity?.id,
    });
    if (enabled && currentUser?.id && activity?.id) {
      checkLimits();
    }
  }, [checkLimits]);

  // Sprawdź limity przy wymuszonego odświeżenia
  useEffect(() => {
    console.log("useSubmissionLimits: refresh useEffect", {
      refreshTrigger,
      lastRefreshTrigger: lastRefreshTriggerRef.current,
      shouldRefresh: shouldRefreshLimits(lastRefreshTriggerRef.current),
    });
    if (shouldRefreshLimits(lastRefreshTriggerRef.current)) {
      checkLimits();
    }
  }, [checkLimits, shouldRefreshLimits, refreshTrigger]);

  const refresh = async () => {
    await checkLimits();
  };

  return {
    limitData,
    stats,
    loading,
    error,
    refresh,
    canSubmit:
      limitData?.canSubmit &&
      (type !== "challenge" || limitData?.challengeLimit?.canSubmit !== false),
  };
};

/**
 * Hook do sprawdzania ogólnych limitów EkoWyzwań
 * @param {boolean} enabled - Czy hook ma być aktywny
 * @returns {Object} - Stan limitów EkoWyzwań
 */
export const useWeeklyChallengeLimit = (enabled = true) => {
  const { currentUser } = useAuth();
  const { refreshTrigger, shouldRefreshLimits } = useLimitsRefresh();
  const [limitData, setLimitData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const lastRefreshTriggerRef = useRef(-1); // Inicjalizuj na -1, żeby pierwsze sprawdzenie działało

  console.log("useWeeklyChallengeLimit: hook initialized", {
    userId: currentUser?.id,
    enabled,
    refreshTrigger,
  });

  // Funkcja do sprawdzania limitów
  const checkLimit = useCallback(async () => {
    if (!enabled || !currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const validation = await validateWeeklyChallengeLimit(currentUser.id);
      setLimitData(validation);
      lastRefreshTriggerRef.current = refreshTrigger;
    } catch (err) {
      console.error("Error checking weekly challenge limit:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled, currentUser?.id, refreshTrigger]);

  // Sprawdź limity przy pierwszym ładowaniu
  useEffect(() => {
    console.log("useWeeklyChallengeLimit: first load useEffect", {
      enabled,
      userId: currentUser?.id,
    });
    if (enabled && currentUser?.id) {
      checkLimit();
    }
  }, [checkLimit]);

  // Sprawdź limity przy wymuszonego odświeżenia
  useEffect(() => {
    console.log("useWeeklyChallengeLimit: refresh useEffect", {
      refreshTrigger,
      lastRefreshTrigger: lastRefreshTriggerRef.current,
      shouldRefresh: shouldRefreshLimits(lastRefreshTriggerRef.current),
    });
    if (shouldRefreshLimits(lastRefreshTriggerRef.current)) {
      checkLimit();
    }
  }, [checkLimit, shouldRefreshLimits, refreshTrigger]);

  const refresh = async () => {
    await checkLimit();
  };

  return {
    limitData,
    loading,
    error,
    refresh,
    canSubmit: limitData?.canSubmit,
  };
};

export default useSubmissionLimits;
