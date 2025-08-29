import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

// Przykładowe przypisane wyzwania zgodne ze strukturą bazy danych
// Teraz wszystkie klasy mają takie same wyzwania - wspólne dla wszystkich
export const assignedChallengesData = {
  "nakretkowy-challenge-global": {
    templateId: "nakretkowy-challenge",
    challengeName: "Nakrętkowy Challenge",
    challengeDescription: "Zbieraj nakrętki przez cały tydzień",
    startDate: new Date("2025-08-28T00:00:00Z"), // Poniedziałek
    endDate: new Date("2025-09-03T23:59:59Z"), // Niedziela
    classProgress: {
      current: 45, // Łączny postęp ze wszystkich klas
      total: 120, // Łączna liczba uczniów ze wszystkich klas
    },
  },
  "tydzien-bez-plastiku-global": {
    templateId: "tydzien-bez-plastiku",
    challengeName: "Tydzień bez plastiku",
    challengeDescription:
      "Spróbuj przez tydzień unikać produktów w plastikowych opakowaniach",
    startDate: new Date("2025-09-04T00:00:00Z"),
    endDate: new Date("2025-09-10T23:59:59Z"),
    classProgress: {
      current: 32,
      total: 98,
    },
  },
  "eko-lunch-challenge-global": {
    templateId: "eko-lunch-challenge",
    challengeName: "EkoLunch Challenge",
    challengeDescription:
      "Przynoś ekologiczny lunch bez jednorazowych opakowań",
    startDate: new Date("2025-09-11T00:00:00Z"),
    endDate: new Date("2025-09-17T23:59:59Z"),
    classProgress: {
      current: 67,
      total: 145,
    },
  },
  "quiz-ekologiczny-global": {
    templateId: "quiz-ekologiczny",
    challengeName: "Quiz ekologiczny",
    challengeDescription: "Rozwiąż quiz o ekologii i środowisku",
    startDate: new Date("2025-09-18T00:00:00Z"),
    endDate: new Date("2025-09-24T23:59:59Z"),
    classProgress: {
      current: 89,
      total: 167,
    },
  },
  "zielony-transport-global": {
    templateId: "zielony-transport",
    challengeName: "Zielony transport",
    challengeDescription:
      "Przez tydzień korzystaj tylko z ekologicznych środków transportu",
    startDate: new Date("2025-09-25T00:00:00Z"),
    endDate: new Date("2025-10-01T23:59:59Z"),
    classProgress: {
      current: 43,
      total: 134,
    },
  },
};

/**
 * Funkcje do masowego dodawania danych do Firestore
 */

export const addAssignedChallengesToFirestore = async () => {
  try {
    const results = [];
    for (const [id, data] of Object.entries(assignedChallengesData)) {
      const docRef = doc(db, "assignedChallenges", id);
      await setDoc(docRef, data);
      results.push(`✅ Dodano przypisane wyzwanie: ${data.challengeName}`);
    }
    return results;
  } catch (error) {
    console.error("Error adding assigned challenges:", error);
    throw error;
  }
};

export const clearAssignedChallenges = async () => {
  try {
    const collectionRef = collection(db, "assignedChallenges");
    const snapshot = await getDocs(collectionRef);
    const results = [];

    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, "assignedChallenges", docSnapshot.id));
      results.push(`🗑️ Usunięto przypisane wyzwanie: ${docSnapshot.id}`);
    }

    return results;
  } catch (error) {
    console.error(`Error clearing assigned challenges:`, error);
    throw error;
  }
};
