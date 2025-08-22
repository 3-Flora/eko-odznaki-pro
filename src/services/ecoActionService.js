import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Pobiera wszystkie dostępne EkoDziałania z Firestore
 */
export const getEcoActions = async () => {
  try {
    const ecoActionsRef = collection(db, "ecoActions");
    const snapshot = await getDocs(ecoActionsRef);

    const ecoActions = [];
    snapshot.docs.forEach((doc) => {
      ecoActions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return ecoActions;
  } catch (error) {
    console.error("Error fetching eco actions:", error);
    return [];
  }
};

/**
 * Grupuje EkoDziałania po kategoriach
 */
export const groupEcoActionsByCategory = (ecoActions) => {
  const grouped = {};

  ecoActions.forEach((action) => {
    const category = action.category || "Inne";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(action);
  });

  return grouped;
};

/**
 * Pobiera statystyki kategorii EkoDziałania
 */
export const getCategoryStats = (ecoActions) => {
  const stats = {};

  ecoActions.forEach((action) => {
    const category = action.category || "Inne";
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
