import {
  createClassNotification,
  createUserNotification,
} from "./notificationService";

/**
 * Serwis do automatycznego tworzenia powiadomień dla ważnych wydarzeń w aplikacji
 */

/**
 * Tworzy powiadomienie gdy nauczyciel zatwierdzi zgłoszenie ucznia
 * @param {Object} submission - Dane zgłoszenia
 * @param {string} teacherId - ID nauczyciela
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createSubmissionApprovedNotification = async (
  submission,
  teacherId,
) => {
  try {
    const title = "Zgłoszenie zatwierdzone! 🎉";
    const message = `Twoje zgłoszenie "${submission.ecoActionName || "EkoDziałanie"}" zostało zatwierdzone przez nauczyciela.`;

    return await createUserNotification(
      title,
      message,
      teacherId,
      submission.studentId,
      "info",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o zatwierdzeniu:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie gdy nauczyciel odrzuci zgłoszenie ucznia
 * @param {Object} submission - Dane zgłoszenia
 * @param {string} teacherId - ID nauczyciela
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createSubmissionRejectedNotification = async (
  submission,
  teacherId,
) => {
  try {
    const title = "Zgłoszenie wymaga poprawek";
    const message = `Twoje zgłoszenie "${submission.ecoActionName || "EkoDziałanie"}" zostało odrzucone. ${submission.rejectionReason ? `Powód: ${submission.rejectionReason}` : ""}`;

    return await createUserNotification(
      title,
      message,
      teacherId,
      submission.studentId,
      "alert",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o odrzuceniu:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie gdy uczeń zdobędzie nową odznakę
 * @param {string} studentId - ID ucznia
 * @param {string} badgeName - Nazwa odznaki
 * @param {number} level - Poziom odznaki
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createBadgeEarnedNotification = async (
  studentId,
  badgeName,
  level,
) => {
  try {
    const title = "Nowa odznaka! 🏅";
    const message = `Gratulacje! Zdobyłeś odznakę "${badgeName}" poziom ${level}!`;

    return await createUserNotification(
      title,
      message,
      "system", // System jako nadawca
      studentId,
      "info",
    );
  } catch (error) {
    console.error("❌ Błąd podczas tworzenia powiadomienia o odznace:", error);
    throw error;
  }
};

/**
 * Tworzy powiadomienie gdy nauczyciel zatwierdzi ucznia do klasy
 * @param {string} studentId - ID ucznia
 * @param {string} teacherId - ID nauczyciela
 * @param {string} className - Nazwa klasy
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createStudentVerifiedNotification = async (
  studentId,
  teacherId,
  className,
) => {
  try {
    const title = "Konto zweryfikowane! ✅";
    const message = `Zostałeś zatwierdzony do klasy ${className}. Możesz teraz korzystać z pełnej funkcjonalności aplikacji!`;

    return await createUserNotification(
      title,
      message,
      teacherId,
      studentId,
      "info",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o weryfikacji:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie o nowym EkoWyzwaniu dla klasy
 * @param {string} classId - ID klasy
 * @param {string} challengeName - Nazwa wyzwania
 * @param {string} createdBy - ID twórcy wyzwania
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createNewChallengeNotification = async (
  classId,
  challengeName,
  createdBy,
) => {
  try {
    const title = "Nowe EkoWyzwanie! 🌱";
    const message = `Dostępne jest nowe wyzwanie: "${challengeName}". Sprawdź je w zakładce Wyzwania!`;

    return await createClassNotification(
      title,
      message,
      createdBy,
      classId,
      "info",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o nowym wyzwaniu:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie przypominające o aktywności
 * @param {string} studentId - ID ucznia
 * @param {number} daysInactive - Liczba dni nieaktywności
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createInactivityReminderNotification = async (
  studentId,
  daysInactive,
) => {
  try {
    const title = "Tęsknimy za Tobą! 🌿";
    const message = `Nie wykonałeś żadnego EkoDziałania od ${daysInactive} dni. Wróć i kontynuuj swoją ekologiczną przygodę!`;

    return await createUserNotification(
      title,
      message,
      "system",
      studentId,
      "reminder",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia przypominającego:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie o zakończeniu EkoWyzwania
 * @param {string} classId - ID klasy
 * @param {string} challengeName - Nazwa wyzwania
 * @param {Object} stats - Statystyki wyzwania
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createChallengeEndedNotification = async (
  classId,
  challengeName,
  stats,
) => {
  try {
    const title = "EkoWyzwanie zakończone! 🏆";
    const message = `Wyzwanie "${challengeName}" dobiegło końca. ${stats.participantsCount} uczniów wzięło udział. Sprawdź wyniki!`;

    return await createClassNotification(
      title,
      message,
      "system",
      classId,
      "info",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o zakończeniu wyzwania:",
      error,
    );
    throw error;
  }
};

/**
 * Tworzy powiadomienie o osiągnięciu milestone'a przez klasę
 * @param {string} classId - ID klasy
 * @param {number} totalActions - Całkowita liczba działań
 * @param {string} teacherId - ID nauczyciela
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createClassMilestoneNotification = async (
  classId,
  totalActions,
  teacherId,
) => {
  try {
    const title = "Kamień milowy osiągnięty! 🎯";
    const message = `Wasza klasa wykonała już ${totalActions} EkoDziałań! To fantastyczny wynik!`;

    return await createClassNotification(
      title,
      message,
      teacherId,
      classId,
      "info",
    );
  } catch (error) {
    console.error(
      "❌ Błąd podczas tworzenia powiadomienia o milestone:",
      error,
    );
    throw error;
  }
};
