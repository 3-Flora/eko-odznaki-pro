import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Dodaje wpis do feedu aktywności klasy
 * @param {string} classId - ID klasy
 * @param {string} studentName - Imię i nazwisko ucznia
 * @param {string} action - Opis akcji (np. "wykonał EkoDziałanie", "ukończył EkoWyzwanie")
 * @param {string} detail - Szczegóły akcji (np. nazwa EkoDziałania)
 * @param {string} type - Typ akcji ("ecoAction", "challenge", "badge")
 * @returns {Promise<boolean>} - True jeśli dodano pomyślnie
 */
export async function addActivityFeedItem(
  classId,
  studentName,
  action,
  detail,
  type = "ecoAction",
) {
  try {
    if (!classId || !studentName || !action || !detail) {
      console.warn("addActivityFeedItem: Brakuje wymaganych parametrów");
      return false;
    }

    const feedCol = collection(db, "activityFeeds", classId, "items");
    const feedItem = {
      text: `${studentName} ${action}: ${detail}`,
      timestamp: serverTimestamp(),
      type,
      studentName,
      action,
      detail,
      classId,
    };

    await addDoc(feedCol, feedItem);
    console.log(`Dodano wpis do feedu klasy ${classId}: ${feedItem.text}`);
    return true;
  } catch (error) {
    console.error("Błąd podczas dodawania wpisu do feedu:", error);
    return false;
  }
}

/**
 * Pobiera ostatnie wpisy z feedu klasy
 * @param {string} classId - ID klasy
 * @param {number} limitCount - Maksymalna liczba wpisów (domyślnie 20)
 * @returns {Promise<Array>} - Lista wpisów feedu
 */
export async function getClassActivityFeed(classId, limitCount = 20) {
  try {
    if (!classId) {
      console.warn("getClassActivityFeed: Brak ID klasy");
      return [];
    }

    const feedCol = collection(db, "activityFeeds", classId, "items");
    const q = query(feedCol, orderBy("timestamp", "desc"), limit(limitCount));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Błąd podczas pobierania feedu klasy:", error);
    return [];
  }
}

/**
 * Pomocnicze funkcje do tworzenia różnych typów wpisów feedu
 */

/**
 * Dodaje wpis o wykonaniu EkoDziałania
 */
export async function addEcoActionFeedItem(
  classId,
  studentName,
  ecoActionName,
) {
  return addActivityFeedItem(
    classId,
    studentName,
    "wykonał EkoDziałanie",
    ecoActionName,
    "ecoAction",
  );
}

/**
 * Dodaje wpis o ukończeniu EkoWyzwania
 */
export async function addChallengeFeedItem(
  classId,
  studentName,
  challengeName,
) {
  return addActivityFeedItem(
    classId,
    studentName,
    "ukończył EkoWyzwanie",
    challengeName,
    "challenge",
  );
}

/**
 * Dodaje wpis o otrzymaniu odznaki
 */
export async function addBadgeFeedItem(classId, studentName, badgeName) {
  return addActivityFeedItem(
    classId,
    studentName,
    "otrzymał odznakę",
    badgeName,
    "badge",
  );
}

/**
 * Dodaje wpis o dołączeniu do klasy
 */
export async function addJoinClassFeedItem(classId, studentName) {
  return addActivityFeedItem(
    classId,
    studentName,
    "dołączył do klasy",
    "Witamy w ekipie!",
    "general",
  );
}

/**
 * Tworzy przykładowe dane feedu dla klasy (do celów debug)
 */
export async function createSampleFeedData(classId) {
  const sampleItems = [
    {
      name: "Anna Kowalska",
      action: "wykonała EkoDziałanie",
      detail: "Segregacja śmieci",
      type: "ecoAction",
    },
    {
      name: "Paweł Nowak",
      action: "ukończyła EkoWyzwanie",
      detail: "Tydzień bez plastiku",
      type: "challenge",
    },
    {
      name: "Maria Wiśniewska",
      action: "otrzymała odznakę",
      detail: "Eco Warrior 🌱",
      type: "badge",
    },
    {
      name: "Tomasz Zieliński",
      action: "wykonał EkoDziałanie",
      detail: "Przyjazd rowerem do szkoły",
      type: "ecoAction",
    },
    {
      name: "Kasia Dąbrowska",
      action: "wykonała EkoDziałanie",
      detail: "Oszczędzanie wody",
      type: "ecoAction",
    },
    {
      name: "Michał Lewandowski",
      action: "otrzymał odznakę",
      detail: "Green Champion 🏆",
      type: "badge",
    },
  ];

  let successCount = 0;
  for (const item of sampleItems) {
    const success = await addActivityFeedItem(
      classId,
      item.name,
      item.action,
      item.detail,
      item.type,
    );
    if (success) successCount++;
  }

  return successCount;
}
