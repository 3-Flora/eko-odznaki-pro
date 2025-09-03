import { useState, useEffect, useRef } from "react";
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
  const [limitData, setLimitData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const lastRefreshTriggerRef = useRef(0);

  // Funkcja do sprawdzania limitów
  const checkLimits = async () => {
    if (!enabled || !currentUser?.id || !activity?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [limitValidation, submissionStats, challengeValidation] =
        await Promise.all([
          validateSubmissionLimits(currentUser.id, activity.id, type, activity),
          getUserSubmissionStats(currentUser.id, activity.id, type),
          type === "challenge"
            ? validateWeeklyChallengeLimit(currentUser.id)
            : Promise.resolve(null),
        ]);

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
  };

  // Sprawdź limity przy pierwszym ładowaniu
  useEffect(() => {
    if (enabled && currentUser?.id && activity?.id && !limitData) {
      checkLimits();
    }
  }, [currentUser?.id, activity?.id, type, enabled]);

  // Sprawdź limity przy wymuszonego odświeżenia
  useEffect(() => {
    if (shouldRefreshLimits(lastRefreshTriggerRef.current)) {
      checkLimits();
    }
  }, [refreshTrigger]);

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
  const lastRefreshTriggerRef = useRef(0);

  // Funkcja do sprawdzania limitów
  const checkLimit = async () => {
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
  };

  // Sprawdź limity przy pierwszym ładowaniu
  useEffect(() => {
    if (enabled && currentUser?.id && !limitData) {
      checkLimit();
    }
  }, [currentUser?.id, enabled]);

  // Sprawdź limity przy wymuszonego odświeżenia
  useEffect(() => {
    if (shouldRefreshLimits(lastRefreshTriggerRef.current)) {
      checkLimit();
    }
  }, [refreshTrigger]);

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
