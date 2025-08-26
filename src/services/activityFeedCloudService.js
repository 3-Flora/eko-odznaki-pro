import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

/**
 * Serwis do komunikacji z Firebase Functions dla feedów aktywności
 */

/**
 * Tworzy pojedynczy wpis w feedzie aktywności klasy
 * @param {string} classId - ID klasy
 * @param {string} studentName - Imię i nazwisko ucznia
 * @param {string} action - Opis akcji
 * @param {string} detail - Szczegóły akcji
 * @param {string} type - Typ akcji
 * @returns {Promise<Object>} - Wynik operacji
 */
export async function createActivityFeedItem(
  classId,
  studentName,
  action,
  detail,
  type = "ecoAction",
) {
  try {
    const createFeedItem = httpsCallable(functions, "createActivityFeedItem");
    const result = await createFeedItem({
      classId,
      studentName,
      action,
      detail,
      type,
    });

    return result.data;
  } catch (error) {
    console.error("Błąd podczas tworzenia wpisu feedu:", error);
    throw error;
  }
}

/**
 * Tworzy wiele wpisów feedu jednocześnie
 * @param {string} classId - ID klasy
 * @param {Array} items - Tablica obiektów z danymi wpisów
 * @returns {Promise<Object>} - Wynik operacji
 */
export async function createBulkActivityFeedItems(classId, items) {
  try {
    const createBulkItems = httpsCallable(
      functions,
      "createBulkActivityFeedItems",
    );
    const result = await createBulkItems({
      classId,
      items,
    });

    return result.data;
  } catch (error) {
    console.error("Błąd podczas masowego tworzenia wpisów feedu:", error);
    throw error;
  }
}

/**
 * Tworzy przykładowe dane feedu dla klasy (tylko do celów deweloperskich)
 * @param {string} classId - ID klasy
 * @returns {Promise<Object>} - Wynik operacji
 */
export async function createSampleFeedData(classId) {
  try {
    const createSampleData = httpsCallable(functions, "createSampleFeedData");
    const result = await createSampleData({ classId });

    return result.data;
  } catch (error) {
    console.error("Błąd podczas tworzenia przykładowych danych:", error);
    throw error;
  }
}

/**
 * Usuwa przykładowe dane feedu z klasy
 * @param {string} classId - ID klasy
 * @returns {Promise<Object>} - Wynik operacji
 */
export async function clearSampleFeedData(classId) {
  try {
    const clearSampleData = httpsCallable(functions, "clearSampleFeedData");
    const result = await clearSampleData({ classId });

    return result.data;
  } catch (error) {
    console.error("Błąd podczas czyszczenia przykładowych danych:", error);
    throw error;
  }
}

/**
 * Pomocnicze funkcje do tworzenia różnych typów wpisów feedu za pomocą Cloud Functions
 */

/**
 * Dodaje wpis o wykonaniu EkoDziałania przez Cloud Function
 */
export async function addEcoActionFeedItemViaFunction(
  classId,
  studentName,
  ecoActionName,
) {
  return createActivityFeedItem(
    classId,
    studentName,
    "wykonał EkoDziałanie",
    ecoActionName,
    "ecoAction",
  );
}

/**
 * Dodaje wpis o ukończeniu EkoWyzwania przez Cloud Function
 */
export async function addChallengeFeedItemViaFunction(
  classId,
  studentName,
  challengeName,
) {
  return createActivityFeedItem(
    classId,
    studentName,
    "ukończył EkoWyzwanie",
    challengeName,
    "challenge",
  );
}

/**
 * Dodaje wpis o otrzymaniu odznaki przez Cloud Function
 */
export async function addBadgeFeedItemViaFunction(
  classId,
  studentName,
  badgeName,
) {
  return createActivityFeedItem(
    classId,
    studentName,
    "otrzymał odznakę",
    badgeName,
    "badge",
  );
}

/**
 * Dodaje wpis o dołączeniu do klasy przez Cloud Function
 */
export async function addJoinClassFeedItemViaFunction(classId, studentName) {
  return createActivityFeedItem(
    classId,
    studentName,
    "dołączył do klasy",
    "Witamy w ekipie!",
    "general",
  );
}

/**
 * Przykład użycia masowego dodawania wpisów
 */
export async function createMultipleFeedItems(classId, studentActivities) {
  const items = studentActivities.map((activity) => ({
    studentName: activity.studentName,
    action: activity.action,
    detail: activity.detail,
    type: activity.type || "ecoAction",
  }));

  return createBulkActivityFeedItems(classId, items);
}

export default {
  createActivityFeedItem,
  createBulkActivityFeedItems,
  createSampleFeedData,
  clearSampleFeedData,
  addEcoActionFeedItemViaFunction,
  addChallengeFeedItemViaFunction,
  addBadgeFeedItemViaFunction,
  addJoinClassFeedItemViaFunction,
  createMultipleFeedItems,
};
