/**
 * 🆕 SERWIS AUTOMATYCZNEJ AKTUALIZACJI LICZNIKÓW UŻYTKOWNIKÓW
 *
 * Ten serwis obsługuje automatyczną aktualizację liczników po zatwierdzeniu/odrzuceniu zgłoszeń.
 * Wywoływany z SubmissionDetailPage.jsx po akceptacji/odrzuceniu EkoDziałań i EkoWyzwań.
 *
 * Główne funkcje:
 * - updateUserCountersOnApproval() - zwiększa liczniki po zatwierdzeniu
 * - revertUserCountersOnRejection() - cofa liczniki po odrzuceniu zatwierdzonego zgłoszenia
 * - checkAndUpdateNewBadges() - sprawdza i przyznaje nowe odznaki
 */

import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getBadgeTemplates, calculateBadgeProgress } from "./badgeService";
import { createBadgeEarnedNotification } from "./notificationAutomationService";
import { addBadgeFeedItem } from "./activityFeedService";

/**
 * Sprawdza czy użytkownik zdobył nowe odznaki i aktualizuje je w profilu
 * @param {string} userId - ID użytkownika
 * @returns {Array} Nowo zdobyte odznaki
 */
export const checkAndUpdateNewBadges = async (userId) => {
  try {
    // Pobierz aktualne dane użytkownika
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.warn("Użytkownik nie istnieje:", userId);
      return [];
    }

    const userData = userDoc.data();
    const userCounters = userData.counters || {};
    const currentEarnedBadges = userData.earnedBadges || {};

    // Pobierz szablony odznak i oblicz postęp
    const badgeTemplates = await getBadgeTemplates();
    const badgeProgress = calculateBadgeProgress(
      userCounters,
      currentEarnedBadges,
      badgeTemplates,
    );

    // Znajdź nowo zdobyte odznaki
    const newlyEarnedBadges = [];
    const badgeUpdates = {};

    badgeProgress.forEach((badge) => {
      if (badge.isEarned && badge.currentLevel > 0) {
        const currentBadge = currentEarnedBadges[badge.id];

        // Sprawdź czy to nowa odznaka lub wyższy poziom
        if (!currentBadge || currentBadge.lvl < badge.currentLevel) {
          const newBadgeData = {
            lvl: badge.currentLevel,
            unlockedAt: new Date().toISOString(),
          };

          badgeUpdates[`earnedBadges.${badge.id}`] = newBadgeData;

          newlyEarnedBadges.push({
            id: badge.id,
            name: badge.name,
            level: badge.currentLevel,
            previousLevel: currentBadge?.lvl || 0,
          });
        }
      }
    });

    // Jeśli są nowe odznaki, zaktualizuj profil użytkownika
    if (Object.keys(badgeUpdates).length > 0) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, badgeUpdates);

      console.log(
        `Zaktualizowano odznaki dla użytkownika ${userId}:`,
        newlyEarnedBadges,
      );
    }

    return newlyEarnedBadges;
  } catch (error) {
    console.error("Błąd podczas sprawdzania nowych odznak:", error);
    return [];
  }
};

/**
 * Aktualizuje liczniki użytkownika po zatwierdzeniu zgłoszenia
 * @param {string} userId - ID użytkownika
 * @param {Object} ecoActivity - Dane EkoDziałania lub EkoWyzwania
 * @param {string} submissionType - Typ zgłoszenia: "eco_action" lub "challenge"
 * @param {string} [userClassId] - ID klasy użytkownika (do feed aktywności)
 * @param {string} [userName] - Nazwa użytkownika (do feed aktywności)
 */
export const updateUserCountersOnApproval = async (
  userId,
  ecoActivity,
  submissionType,
  userClassId = null,
  userName = null,
) => {
  try {
    const userRef = doc(db, "users", userId);

    // Przygotuj aktualizacje liczników
    const counterUpdates = {};

    if (submissionType === "eco_action") {
      // Zwiększ totalActions
      counterUpdates["counters.totalActions"] = increment(1);

      // Zwiększ odpowiedni licznik kategorii na podstawie counterToIncrement
      if (ecoActivity.counterToIncrement) {
        counterUpdates[`counters.${ecoActivity.counterToIncrement}`] =
          increment(1);
      }
    } else if (submissionType === "challenge") {
      // Zwiększ totalChallenges
      counterUpdates["counters.totalChallenges"] = increment(1);

      // Jeśli EkoWyzwanie ma kategorię, zwiększ odpowiedni licznik
      if (ecoActivity.counterToIncrement) {
        counterUpdates[`counters.${ecoActivity.counterToIncrement}`] =
          increment(1);
      }
    }

    // Zaktualizuj liczniki w bazie danych
    await updateDoc(userRef, counterUpdates);

    console.log(
      `Zaktualizowano liczniki dla użytkownika ${userId}:`,
      counterUpdates,
    );

    // Sprawdź czy użytkownik zdobył nowe odznaki
    const newBadges = await checkAndUpdateNewBadges(userId);

    // Wyślij powiadomienia i dodaj do feed aktywności dla nowych odznak
    for (const badge of newBadges) {
      try {
        await createBadgeEarnedNotification(userId, badge.name, badge.level);
        console.log(
          `Wysłano powiadomienie o nowej odznace: ${badge.name} poziom ${badge.level}`,
        );
      } catch (notificationError) {
        console.error(
          "Błąd podczas wysyłania powiadomienia o odznace:",
          notificationError,
        );
        // Nie przerywamy procesu jeśli powiadomienie się nie uda
      }

      // Dodaj wpis do feed aktywności jeśli mamy dane o klasie i nazwie użytkownika
      if (userClassId && userName) {
        try {
          await addBadgeFeedItem(
            userClassId,
            userName,
            `${badge.name} (poziom ${badge.level})`,
          );
          console.log(
            `Dodano wpis do feed aktywności o nowej odznace: ${badge.name}`,
          );
        } catch (feedError) {
          console.error(
            "Błąd podczas dodawania wpisu do feed aktywności:",
            feedError,
          );
          // Nie przerywamy procesu jeśli feed się nie uda
        }
      }
    }

    return { success: true, updates: counterUpdates, newBadges };
  } catch (error) {
    console.error("Błąd podczas aktualizacji liczników użytkownika:", error);
    throw new Error(`Nie udało się zaktualizować liczników: ${error.message}`);
  }
};

/**
 * Cofa aktualizację liczników użytkownika (np. gdy zgłoszenie zostaje odrzucone po zatwierdzeniu)
 * @param {string} userId - ID użytkownika
 * @param {Object} ecoActivity - Dane EkoDziałania lub EkoWyzwania
 * @param {string} submissionType - Typ zgłoszenia: "eco_action" lub "challenge"
 */
export const revertUserCountersOnRejection = async (
  userId,
  ecoActivity,
  submissionType,
) => {
  try {
    const userRef = doc(db, "users", userId);

    // Przygotuj aktualizacje liczników (odejmowanie)
    const counterUpdates = {};

    if (submissionType === "eco_action") {
      // Zmniejsz totalActions
      counterUpdates["counters.totalActions"] = increment(-1);

      // Zmniejsz odpowiedni licznik kategorii na podstawie counterToIncrement
      if (ecoActivity.counterToIncrement) {
        counterUpdates[`counters.${ecoActivity.counterToIncrement}`] =
          increment(-1);
      }
    } else if (submissionType === "challenge") {
      // Zmniejsz totalChallenges
      counterUpdates["counters.totalChallenges"] = increment(-1);

      // Jeśli EkoWyzwanie ma kategorię, zmniejsz odpowiedni licznik
      if (ecoActivity.counterToIncrement) {
        counterUpdates[`counters.${ecoActivity.counterToIncrement}`] =
          increment(-1);
      }
    }

    // Zaktualizuj liczniki w bazie danych
    await updateDoc(userRef, counterUpdates);

    console.log(`Cofnięto liczniki dla użytkownika ${userId}:`, counterUpdates);

    return { success: true, updates: counterUpdates };
  } catch (error) {
    console.error("Błąd podczas cofania liczników użytkownika:", error);
    throw new Error(`Nie udało się cofnąć liczników: ${error.message}`);
  }
};

/**
 * Pobiera aktualne liczniki użytkownika
 * @param {string} userId - ID użytkownika
 * @returns {Object} Aktualne liczniki użytkownika
 */
export const getUserCounters = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      throw new Error("Użytkownik nie istnieje");
    }

    const userData = userDoc.data();
    return userData.counters || {};
  } catch (error) {
    console.error("Błąd podczas pobierania liczników użytkownika:", error);
    throw new Error(`Nie udało się pobrać liczników: ${error.message}`);
  }
};
