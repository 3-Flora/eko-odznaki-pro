import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";

// Przykładowe szablony odznak zgodne ze strukturą z Twojego opisu
export const badgeTemplatesData = {
  "mistrz-recyklingu": {
    name: "Mistrz recyklingu",
    category: "Recykling",
    counterToCheck: "recyclingActions",
    badgeImage: "mistrz_recyklingu.png",
    levels: [
      {
        level: 1,
        description: "Wykonaj 3 EkoDziałań z kategorii Recykling",
        requiredCount: 3,
      },
      {
        level: 2,
        description: "Wykonaj 10 EkoDziałań z kategorii Recykling",
        requiredCount: 10,
      },
      {
        level: 3,
        description: "Wykonaj 25 EkoDziałań z kategorii Recykling",
        requiredCount: 25,
      },
      {
        level: 4,
        description: "Wykonaj 50 EkoDziałań z kategorii Recykling",
        requiredCount: 50,
      },
    ],
  },
  "eko-edukator": {
    name: "Eko Edukator",
    category: "Edukacja",
    counterToCheck: "educationActions",
    badgeImage: "eko_edukator.png",
    levels: [
      {
        level: 1,
        description: "Wykonaj 2 EkoDziałania z kategorii Edukacja",
        requiredCount: 2,
      },
      {
        level: 2,
        description: "Wykonaj 8 EkoDziałań z kategorii Edukacja",
        requiredCount: 8,
      },
      {
        level: 3,
        description: "Wykonaj 20 EkoDziałań z kategorii Edukacja",
        requiredCount: 20,
      },
      {
        level: 4,
        description: "Wykonaj 50 EkoDziałań z kategorii Edukacja",
        requiredCount: 50,
      },
    ],
  },
  "mistrz-oszczedzania": {
    name: "Mistrz Oszczędzania",
    category: "Oszczędzanie",
    counterToCheck: "savingActions",
    badgeImage: "mistrz_oszczedzania.png",
    levels: [
      {
        level: 1,
        description: "Wykonaj 5 EkoDziałań z kategorii Oszczędzanie",
        requiredCount: 5,
      },
      {
        level: 2,
        description: "Wykonaj 15 EkoDziałań z kategorii Oszczędzanie",
        requiredCount: 15,
      },
      {
        level: 3,
        description: "Wykonaj 30 EkoDziałań z kategorii Oszczędzanie",
        requiredCount: 30,
      },
      {
        level: 4,
        description: "Wykonaj 50 EkoDziałań z kategorii Oszczędzanie",
        requiredCount: 50,
      },
    ],
  },
  "eko-aktywista": {
    name: "Eko Aktywista",
    category: "Ogólne",
    counterToCheck: "totalActions",
    badgeImage: "eco_aktywista.png",
    levels: [
      {
        level: 1,
        description: "Wykonaj łącznie 10 EkoDziałań",
        requiredCount: 10,
      },
      {
        level: 2,
        description: "Wykonaj łącznie 25 EkoDziałań",
        requiredCount: 25,
      },
      {
        level: 3,
        description: "Wykonaj łącznie 50 EkoDziałań",
        requiredCount: 50,
      },
      {
        level: 4,
        description: "Wykonaj łącznie 100 EkoDziałań",
        requiredCount: 100,
      },
    ],
  },
  "mistrz-wyzwan": {
    name: "Mistrz Wyzwań",
    category: "Wyzwania",
    counterToCheck: "totalChallenges",
    badgeImage: "mistrz_wyzwan.png",
    levels: [
      {
        level: 1,
        description: "Ukończ 1 EkoWyzwanie",
        requiredCount: 1,
      },
      {
        level: 2,
        description: "Ukończ 5 EkoWyzwań",
        requiredCount: 5,
      },
      {
        level: 3,
        description: "Ukończ 15 EkoWyzwań",
        requiredCount: 15,
      },
      {
        level: 4,
        description: "Ukończ 30 EkoWyzwań",
        requiredCount: 30,
      },
    ],
  },
};

/**
 * Funkcja do inicjalizacji szablonów odznak w Firestore
 * UWAGA: Uruchom to tylko raz, aby utworzyć szablony w bazie danych
 */
export const initializeBadgeTemplates = async () => {
  try {
    console.log("Rozpoczynam inicjalizację szablonów odznak...");

    for (const [badgeId, badgeData] of Object.entries(badgeTemplatesData)) {
      const badgeRef = doc(db, "badgeTemplates", badgeId);
      await setDoc(badgeRef, badgeData);
      console.log(`✅ Utworzono szablon odznaki: ${badgeId}`);
    }

    console.log("🎉 Wszystkie szablony odznak zostały utworzone!");
    return true;
  } catch (error) {
    console.error("❌ Błąd podczas tworzenia szablonów odznak:", error);
    return false;
  }
};

/**
 * Funkcja do dodawania szablonów odznak do Firestore (do użytku w DatabaseManager)
 */
export const addBadgeTemplatesToFirestore = async () => {
  try {
    const results = [];
    for (const [badgeId, badgeData] of Object.entries(badgeTemplatesData)) {
      const badgeRef = doc(db, "badgeTemplates", badgeId);
      await setDoc(badgeRef, badgeData);
      results.push(`✅ Dodano odznakę: ${badgeData.name}`);
    }
    return results;
  } catch (error) {
    console.error("Error adding badge templates:", error);
    throw error;
  }
};

/**
 * Funkcja do usuwania wszystkich szablonów odznak
 */
export const clearBadgeTemplates = async () => {
  try {
    const badgeTemplatesRef = collection(db, "badgeTemplates");
    const snapshot = await getDocs(badgeTemplatesRef);
    const results = [];

    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, "badgeTemplates", docSnapshot.id));
      results.push(`🗑️ Usunięto odznakę: ${docSnapshot.id}`);
    }

    return results;
  } catch (error) {
    console.error("Error clearing badge templates:", error);
    throw error;
  }
};

/**
 * Funkcja do testowania danych użytkownika z przykładowymi counterami
 */
export const getTestUserCounters = () => {
  return {
    totalActions: 15,
    totalChallenges: 2,
    recyclingActions: 5,
    educationActions: 3,
    savingActions: 7,
  };
};
