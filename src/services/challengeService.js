import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Pobiera wszystkie przypisane wyzwania (teraz wszystkie klasy mają takie same wyzwania)
 */
export const getAssignedChallenges = async () => {
  try {
    const assignedChallengesRef = collection(db, "assignedChallenges");
    const snapshot = await getDocs(assignedChallengesRef);

    const assignedChallenges = [];
    for (const docSnapshot of snapshot.docs) {
      const assignedData = docSnapshot.data();

      // Pobierz dane szablonu wyzwania
      let templateData = null;
      if (assignedData.templateId) {
        try {
          const templateRef = doc(
            db,
            "challengeTemplates",
            assignedData.templateId,
          );
          const templateSnap = await getDoc(templateRef);
          if (templateSnap.exists()) {
            templateData = templateSnap.data();
          }
        } catch (error) {
          console.error("Error fetching challenge template:", error);
        }
      }

      // Połącz dane przypisanego wyzwania z danymi szablonu
      assignedChallenges.push({
        id: docSnapshot.id,
        ...assignedData,
        // Dane z szablonu mają pierwszeństwo, ale możemy je nadpisać
        name:
          assignedData.challengeName ||
          templateData?.name ||
          "Nieznane wyzwanie",
        description:
          assignedData.challengeDescription || templateData?.description || "",
        category: templateData?.category || "Inne",
        templateData: templateData, // Zachowaj oryginalne dane szablonu
      });
    }

    return assignedChallenges;
  } catch (error) {
    console.error("Error fetching assigned challenges:", error);
    return [];
  }
};

/**
 * Pobiera aktywne wyzwania (między startDate a endDate)
 * Wszystkie klasy mają teraz takie same aktywne wyzwania
 */
export const getActiveChallenges = async () => {
  try {
    const allChallenges = await getAssignedChallenges();
    const now = new Date();

    return allChallenges.filter((challenge) => {
      if (!challenge.startDate || !challenge.endDate) {
        return true; // Jeśli nie ma dat, traktuj jako zawsze aktywne
      }

      const startDate = challenge.startDate.toDate
        ? challenge.startDate.toDate()
        : new Date(challenge.startDate);
      const endDate = challenge.endDate.toDate
        ? challenge.endDate.toDate()
        : new Date(challenge.endDate);

      return now >= startDate && now <= endDate;
    });
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    return [];
  }
};

/**
 * Grupuje przypisane wyzwania po kategoriach
 */
export const groupAssignedChallengesByCategory = (challenges) => {
  const grouped = {};

  challenges.forEach((challenge) => {
    const category = challenge.category || "Inne";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(challenge);
  });

  return grouped;
};

/**
 * Pobiera statystyki kategorii przypisanych wyzwań
 */
export const getAssignedChallengeCategoryStats = (challenges) => {
  const stats = {};

  challenges.forEach((challenge) => {
    const category = challenge.category || "Inne";
    if (!stats[category]) {
      stats[category] = {
        name: category,
        count: 0,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
      };
    }
    stats[category].count++;
  });

  return Object.values(stats);
};

/**
 * Pomocnicza funkcja do pobierania ikony kategorii
 */
const getCategoryIcon = (category) => {
  const icons = {
    Recykling: "♻️",
    Edukacja: "📚",
    Oszczędzanie: "💡",
    Transport: "🚲",
    Energia: "⚡",
    Woda: "💧",
  };
  return icons[category] || "🌱";
};

/**
 * Pomocnicza funkcja do pobierania koloru kategorii
 */
const getCategoryColor = (category) => {
  const colors = {
    Recykling: "text-green-600",
    Edukacja: "text-blue-600",
    Oszczędzanie: "text-yellow-600",
    Transport: "text-orange-600",
    Energia: "text-purple-600",
    Woda: "text-cyan-600",
  };
  return colors[category] || "text-gray-600";
};
