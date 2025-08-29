/**
 * Definicje kategorii EkoDziałań używane w całej aplikacji
 */

export const ECO_CATEGORIES = [
  {
    id: "recycling",
    name: "Recykling",
    icon: "♻️",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    counterKey: "recyclingActions",
    description: "Działania związane z segregacją i recyklingiem odpadów",
  },
  {
    id: "education",
    name: "Edukacja",
    icon: "📚",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    counterKey: "educationActions",
    description: "Działania edukacyjne i zwiększające świadomość ekologiczną",
  },
  {
    id: "saving",
    name: "Oszczędzanie",
    icon: "💰",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    counterKey: "savingActions",
    description: "Oszczędzanie zasobów i pieniędzy",
  },
  {
    id: "transport",
    name: "Transport",
    icon: "🚲",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    counterKey: "transportActions",
    description: "Ekologiczne formy transportu",
  },
  {
    id: "energy",
    name: "Energia",
    icon: "⚡",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    counterKey: "energyActions",
    description: "Oszczędzanie energii i korzystanie z OZE",
  },
  {
    id: "food",
    name: "Jedzenie",
    icon: "🥗",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    counterKey: "foodActions",
    description: "Świadome wybory żywieniowe",
  },
];

/**
 * Pobiera kategorię po ID
 */
export function getCategoryById(id) {
  return ECO_CATEGORIES.find((category) => category.id === id);
}

/**
 * Pobiera kategorię po kluczu countera
 */
export function getCategoryByCounterKey(counterKey) {
  return ECO_CATEGORIES.find((category) => category.counterKey === counterKey);
}

/**
 * Generuje statystyki kategorii na podstawie liczników użytkownika
 */
export function generateCategoryStats(userCounters = {}) {
  return ECO_CATEGORIES.map((category) => ({
    ...category,
    count: userCounters[category.counterKey] || 0,
  }));
}

/**
 * Pobiera wszystkie nazwy kategorii
 */
export function getCategoryNames() {
  return ECO_CATEGORIES.map((category) => category.name);
}

/**
 * Pobiera mapę ID kategorii do ich nazw
 */
export function getCategoryIdToNameMap() {
  return ECO_CATEGORIES.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {});
}
