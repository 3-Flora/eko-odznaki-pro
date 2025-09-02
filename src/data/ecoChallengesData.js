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
export const ecoChallengesData = {
  "nakretkowy-challenge-global": {
    name: "Nakrętkowy Challenge",
    description: "Zbieraj nakrętki przez cały tydzień",
    category: "Recykling",
    startDate: new Date("2025-08-28T00:00:00Z"), // Poniedziałek
    endDate: new Date("2025-09-03T23:59:59Z"), // Niedziela
    style: {
      color: "green",
      icon: "♻️",
    },
    maxDaily: 1,
    maxWeekly: 1,
  },
  "tydzien-bez-plastiku-global": {
    name: "Tydzień bez plastiku",
    description:
      "Spróbuj przez tydzień unikać produktów w plastikowych opakowaniach",
    category: "Recykling",
    startDate: new Date("2025-09-04T00:00:00Z"),
    endDate: new Date("2025-09-10T23:59:59Z"),
    style: {
      color: "blue",
      icon: "🚫",
    },
    maxDaily: 1,
    maxWeekly: 1,
  },
  "eko-lunch-challenge-global": {
    name: "EkoLunch Challenge",
    description: "Przynoś ekologiczny lunch bez jednorazowych opakowań",
    category: "Oszczędzanie",
    startDate: new Date("2025-09-11T00:00:00Z"),
    endDate: new Date("2025-09-17T23:59:59Z"),
    style: {
      color: "green",
      icon: "🥗",
    },
    maxDaily: 1,
    maxWeekly: 1,
  },
  "quiz-ekologiczny-global": {
    name: "Quiz ekologiczny",
    description: "Rozwiąż quiz o ekologii i środowisku",
    category: "Edukacja",
    startDate: new Date("2025-09-18T00:00:00Z"),
    endDate: new Date("2025-09-24T23:59:59Z"),
    style: {
      color: "yellow",
      icon: "📝",
    },
    maxDaily: 1,
    maxWeekly: 1,
  },
  "zielony-transport-global": {
    name: "Zielony transport",
    description:
      "Przez tydzień korzystaj tylko z ekologicznych środków transportu",
    category: "Transport",
    startDate: new Date("2025-09-25T00:00:00Z"),
    endDate: new Date("2025-10-01T23:59:59Z"),
    style: {
      color: "green",
      icon: "🚲",
    },
    maxDaily: 1,
    maxWeekly: 1,
  },
};

/**
 * Funkcje do masowego dodawania danych do Firestore
 */
export const addEcoChallengesToFirestore = async () => {
  try {
    const results = [];
    for (const [id, data] of Object.entries(ecoChallengesData)) {
      const docRef = doc(db, "ecoChallenges", id);
      await setDoc(docRef, data);
      results.push(`✅ Dodano przypisane wyzwanie: ${data.name}`);
    }
    return results;
  } catch (error) {
    console.error("Error adding assigned challenges:", error);
    throw error;
  }
};

export const clearEcoChallenges = async () => {
  try {
    const collectionRef = collection(db, "ecoChallenges");
    const snapshot = await getDocs(collectionRef);
    const results = [];

    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, "ecoChallenges", docSnapshot.id));
      results.push(`🗑️ Usunięto przypisane wyzwanie: ${docSnapshot.id}`);
    }

    return results;
  } catch (error) {
    console.error(`Error clearing assigned challenges:`, error);
    throw error;
  }
};
