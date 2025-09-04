import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { getCachedUserSubmissions } from "./contentCache";

/**
 * Sprawdza, czy użytkownik może zgłosić konkretne EkoDziałanie lub EkoWyzwanie (używa cache gdy możliwe)
 * @param {string} userId - ID użytkownika
 * @param {string} activityId - ID aktywności (ecoAction lub ecoChallenge)
 * @param {string} type - Typ aktywności ("eco_action" lub "challenge")
 * @param {Object} activityData - Dane aktywności z limitami (maxDaily, maxWeekly)
 * @param {boolean} useCache - Czy używać cache (domyślnie true)
 * @returns {Promise<Object>} - Wynik walidacji z informacjami o limitach
 */
export const validateSubmissionLimits = async (
  userId,
  activityId,
  type,
  activityData,
  useCache = true,
) => {
  try {
    // Pobierz obecną datę i oblicz zakresy
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Oblicz początek tygodnia (poniedziałek)
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Niedziela = 0, więc 6 dni od poniedziałku
    const weekStart = new Date(
      todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
    );
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

    let allSubmissions;

    if (useCache) {
      // Try to get submissions from cache first
      try {
        const cachedSubmissions = await getCachedUserSubmissions(userId);
        // Filter for specific activity and type
        allSubmissions = cachedSubmissions.filter(
          (submission) =>
            submission.ecoActivityId === activityId &&
            submission.type === type &&
            (submission.status === "approved" ||
              submission.status === "pending"),
        );
      } catch (cacheError) {
        console.log("Cache failed, falling back to direct query:", cacheError);
        useCache = false;
      }
    }

    if (!useCache) {
      // Fallback to direct database query
      const baseQuery = query(
        collection(db, "submissions"),
        where("studentId", "==", userId),
        where("ecoActivityId", "==", activityId),
        where("type", "==", type),
      );

      const allSubmissionsSnapshot = await getDocs(baseQuery);

      // Filtruj w pamięci zamiast w bazie danych
      allSubmissions = allSubmissionsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (submission) =>
            submission.status === "approved" || submission.status === "pending",
        );
    }

    // Policz zgłoszenia dzisiejsze
    const todaySubmissions = allSubmissions.filter((submission) => {
      const submissionDate = submission.createdAt?.toDate
        ? submission.createdAt.toDate()
        : new Date(submission.createdAt);
      return submissionDate >= todayStart && submissionDate <= todayEnd;
    });
    const todayCount = todaySubmissions.length;

    // Policz zgłoszenia tygodniowe
    const weekSubmissions = allSubmissions.filter((submission) => {
      const submissionDate = submission.createdAt?.toDate
        ? submission.createdAt.toDate()
        : new Date(submission.createdAt);
      return submissionDate >= weekStart && submissionDate <= weekEnd;
    });
    const weekCount = weekSubmissions.length;

    // Pobierz limity z danych aktywności
    const maxDaily = activityData.maxDaily || 999; // Jeśli brak limitu, ustaw bardzo wysoką wartość
    const maxWeekly = activityData.maxWeekly || 999;

    // Sprawdź, czy limity zostały przekroczone
    const dailyLimitExceeded = todayCount >= maxDaily;
    const weeklyLimitExceeded = weekCount >= maxWeekly;

    // Dla EkoWyzwań, dodatkowo sprawdź czy użytkownik może zgłosić tylko jedno na tydzień
    if (type === "challenge") {
      let allChallenges;

      if (useCache) {
        // Use cached submissions for challenge check
        try {
          const cachedSubmissions = await getCachedUserSubmissions(userId);
          allChallenges = cachedSubmissions
            .filter(
              (submission) =>
                submission.type === "challenge" &&
                (submission.status === "approved" ||
                  submission.status === "pending"),
            )
            .filter((submission) => {
              const submissionDate = submission.createdAt?.toDate
                ? submission.createdAt.toDate()
                : new Date(submission.createdAt);
              return submissionDate >= weekStart && submissionDate <= weekEnd;
            });
        } catch (cacheError) {
          console.log(
            "Cache failed for challenge check, falling back to direct query:",
            cacheError,
          );
          useCache = false;
        }
      }

      if (!useCache) {
        // Fallback to direct query for challenge check
        const allChallengesQuery = query(
          collection(db, "submissions"),
          where("studentId", "==", userId),
          where("type", "==", "challenge"),
        );

        const allChallengesSnapshot = await getDocs(allChallengesQuery);
        allChallenges = allChallengesSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (submission) =>
              (submission.status === "approved" ||
                submission.status === "pending") &&
              submission.createdAt.toDate() >= weekStart &&
              submission.createdAt.toDate() <= weekEnd,
          );
      }

      if (allChallenges.length >= 1) {
        return {
          canSubmit: false,
          reason: "Możesz zgłosić tylko jedno EkoWyzwanie na tydzień",
          limitType: "weekly_challenge_global",
          currentCount: allChallenges.length,
          maxAllowed: 1,
          resetDate: new Date(weekEnd.getTime() + 1), // Następny poniedziałek
        };
      }
    }

    // Sprawdź limity
    if (dailyLimitExceeded) {
      return {
        canSubmit: false,
        reason: `Osiągnięto dzienny limit dla tej aktywności (${maxDaily}/${maxDaily})`,
        limitType: "daily",
        currentCount: todayCount,
        maxAllowed: maxDaily,
        resetDate: new Date(todayEnd.getTime() + 1), // Następny dzień
      };
    }

    if (weeklyLimitExceeded) {
      return {
        canSubmit: false,
        reason: `Osiągnięto tygodniowy limit dla tej aktywności (${maxWeekly}/${maxWeekly})`,
        limitType: "weekly",
        currentCount: weekCount,
        maxAllowed: maxWeekly,
        resetDate: new Date(weekEnd.getTime() + 1), // Następny poniedziałek
      };
    }

    // Jeśli wszystko OK
    return {
      canSubmit: true,
      currentDailyCount: todayCount,
      maxDaily: maxDaily,
      currentWeeklyCount: weekCount,
      maxWeekly: maxWeekly,
      remainingDaily: maxDaily - todayCount,
      remainingWeekly: maxWeekly - weekCount,
    };
  } catch (error) {
    console.error("Error validating submission limits:", error);
    // W przypadku błędu, pozwól na zgłoszenie (failsafe)
    return {
      canSubmit: true,
      error: "Nie udało się sprawdzić limitów",
    };
  }
};

/**
 * Pobiera statystyki zgłoszeń użytkownika dla danej aktywności (używa cache gdy możliwe)
 * @param {string} userId - ID użytkownika
 * @param {string} activityId - ID aktywności
 * @param {string} type - Typ aktywności
 * @param {boolean} useCache - Czy używać cache (domyślnie true)
 * @returns {Promise<Object>} - Statystyki zgłoszeń
 */
export const getUserSubmissionStats = async (
  userId,
  activityId,
  type,
  useCache = true,
) => {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(
      todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
    );

    let allSubmissions;

    if (useCache) {
      // Try to get submissions from cache first
      try {
        const cachedSubmissions = await getCachedUserSubmissions(userId);
        // Filter for specific activity and type
        allSubmissions = cachedSubmissions.filter(
          (submission) =>
            submission.ecoActivityId === activityId &&
            submission.type === type &&
            (submission.status === "approved" ||
              submission.status === "pending"),
        );
      } catch (cacheError) {
        console.log("Cache failed, falling back to direct query:", cacheError);
        useCache = false;
      }
    }

    if (!useCache) {
      // Fallback to direct database query
      const baseQuery = query(
        collection(db, "submissions"),
        where("studentId", "==", userId),
        where("ecoActivityId", "==", activityId),
        where("type", "==", type),
      );

      const allSubmissionsSnapshot = await getDocs(baseQuery);

      // Filtruj w pamięci
      allSubmissions = allSubmissionsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (submission) =>
            submission.status === "approved" || submission.status === "pending",
        );
    }

    // Filtruj dzisiejsze
    const todaySubmissions = allSubmissions.filter((submission) => {
      const submissionDate = submission.createdAt?.toDate
        ? submission.createdAt.toDate()
        : new Date(submission.createdAt);
      return submissionDate >= todayStart;
    });

    // Filtruj tygodniowe
    const weekSubmissions = allSubmissions.filter((submission) => {
      const submissionDate = submission.createdAt?.toDate
        ? submission.createdAt.toDate()
        : new Date(submission.createdAt);
      return submissionDate >= weekStart;
    });

    return {
      todayCount: todaySubmissions.length,
      weekCount: weekSubmissions.length,
      todaySubmissions: todaySubmissions,
      weekSubmissions: weekSubmissions,
    };
  } catch (error) {
    console.error("Error getting user submission stats:", error);
    return {
      todayCount: 0,
      weekCount: 0,
      todaySubmissions: [],
      weekSubmissions: [],
    };
  }
};

/**
 * Sprawdza ogólne limity EkoWyzwań dla użytkownika (jedno na tydzień) (używa cache gdy możliwe)
 * @param {string} userId - ID użytkownika
 * @param {boolean} useCache - Czy używać cache (domyślnie true)
 * @returns {Promise<Object>} - Wynik sprawdzenia limitów EkoWyzwań
 */
export const validateWeeklyChallengeLimit = async (userId, useCache = true) => {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const currentDay = now.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(
      todayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
    );
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

    let weekChallenges;

    if (useCache) {
      // Try to get submissions from cache first
      try {
        const cachedSubmissions = await getCachedUserSubmissions(userId);
        // Filter for challenges in current week
        weekChallenges = cachedSubmissions.filter((submission) => {
          const submissionDate = submission.createdAt?.toDate
            ? submission.createdAt.toDate()
            : new Date(submission.createdAt);
          return (
            submission.type === "challenge" &&
            (submission.status === "approved" ||
              submission.status === "pending") &&
            submissionDate >= weekStart &&
            submissionDate <= weekEnd
          );
        });
      } catch (cacheError) {
        console.log("Cache failed, falling back to direct query:", cacheError);
        useCache = false;
      }
    }

    if (!useCache) {
      // Fallback to direct database query
      const challengesQuery = query(
        collection(db, "submissions"),
        where("studentId", "==", userId),
        where("type", "==", "challenge"),
      );

      const snapshot = await getDocs(challengesQuery);

      // Filtruj w pamięci zamiast w bazie danych
      weekChallenges = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((submission) => {
          const submissionDate = submission.createdAt.toDate();
          return (
            (submission.status === "approved" ||
              submission.status === "pending") &&
            submissionDate >= weekStart &&
            submissionDate <= weekEnd
          );
        });
    }

    const challengeCount = weekChallenges.length;

    if (challengeCount >= 1) {
      const existingChallenge = weekChallenges[0];
      return {
        canSubmit: false,
        reason: "Możesz zgłosić tylko jedno EkoWyzwanie na tydzień",
        currentCount: challengeCount,
        maxAllowed: 1,
        existingChallenge: existingChallenge,
        resetDate: new Date(weekEnd.getTime() + 1),
      };
    }

    return {
      canSubmit: true,
      currentCount: challengeCount,
      maxAllowed: 1,
      remaining: 1 - challengeCount,
    };
  } catch (error) {
    console.error("Error validating weekly challenge limit:", error);
    return {
      canSubmit: true,
      error: "Nie udało się sprawdzić limitów EkoWyzwań",
    };
  }
};

/**
 * Formatuje datę resetowania limitów
 * @param {Date} resetDate - Data resetowania
 * @returns {string} - Sformatowana data
 */
export const formatResetDate = (resetDate) => {
  const now = new Date();
  const diffTime = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "jutro";
  } else if (diffDays <= 7) {
    return `za ${diffDays} dni`;
  } else {
    return resetDate.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};
