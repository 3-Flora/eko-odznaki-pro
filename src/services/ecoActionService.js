import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
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

/**
 * Pobiera ograniczoną liczbę EkoDziałań dla dashboardu
 * @param {number} limitCount - Maksymalna liczba EkoDziałań do pobrania
 * @returns {Promise<Array>} - Lista EkoDziałań
 */
export const getLimitedEcoActions = async (limitCount = 3) => {
  try {
    const q = query(collection(db, "ecoActions"), orderBy("name"), limit(10));

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return items.slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching limited eco actions:", error);
    return [];
  }
};
