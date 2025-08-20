import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Pobiera wszystkie szablony odznak z Firestore
 */
export const getBadgeTemplates = async () => {
  try {
    const badgeTemplatesRef = collection(db, "badgeTemplates");
    const snapshot = await getDocs(badgeTemplatesRef);

    const templates = {};
    snapshot.docs.forEach((doc) => {
      templates[doc.id] = {
        id: doc.id,
        ...doc.data(),
      };
    });

    return templates;
  } catch (error) {
    console.error("Error fetching badge templates:", error);
    return {};
  }
};

/**
 * Oblicza postęp użytkownika dla wszystkich odznak
 * @param {Object} userCounters - countery użytkownika
 * @param {Object} userEarnedBadges - zdobyte odznaki użytkownika
 * @param {Object} badgeTemplates - szablony odznak
 */
export const calculateBadgeProgress = (
  userCounters = {},
  userEarnedBadges = {},
  badgeTemplates = {},
) => {
  const badgeProgress = [];

  Object.entries(badgeTemplates).forEach(([badgeId, template]) => {
    const userBadge = userEarnedBadges[badgeId];
    const currentCount = userCounters[template.counterToCheck] || 0;

    // Znajdź aktualny poziom użytkownika dla tej odznaki
    let currentLevel = 0;
    let nextLevel = null;
    let currentLevelData = null;
    let nextLevelData = null;

    // Sprawdź wszystkie poziomy aby znaleźć aktualny
    const sortedLevels =
      template.levels?.sort((a, b) => a.level - b.level) || [];

    for (const levelData of sortedLevels) {
      if (currentCount >= levelData.requiredCount) {
        currentLevel = levelData.level;
        currentLevelData = levelData;
      } else {
        // To jest następny poziom do osiągnięcia
        if (!nextLevelData) {
          nextLevelData = levelData;
          nextLevel = levelData.level;
        }
        break;
      }
    }

    // Jeśli użytkownik ma zapisaną odznakę, ale obliczony poziom jest wyższy,
    // użyj wyższego poziomu (może być wynik aktualizacji counters)
    const earnedLevel = userBadge?.lvl || 0;
    const actualLevel = Math.max(currentLevel, earnedLevel);

    // Znajdź następny poziom jeśli jeszcze go nie ma
    if (!nextLevelData && actualLevel > 0) {
      nextLevelData = sortedLevels.find((level) => level.level > actualLevel);
      if (nextLevelData) {
        nextLevel = nextLevelData.level;
      }
    }

    const badgeInfo = {
      id: badgeId,
      name: template.name,
      category: template.category,
      currentLevel: actualLevel,
      currentLevelData,
      nextLevel,
      nextLevelData,
      currentCount,
      isEarned: actualLevel > 0,
      progress: nextLevelData
        ? Math.min(100, (currentCount / nextLevelData.requiredCount) * 100)
        : 100,
      progressText: nextLevelData
        ? `${currentCount}/${nextLevelData.requiredCount}`
        : "Maksymalny poziom",
    };

    badgeProgress.push(badgeInfo);
  });

  return badgeProgress;
};

/**
 * Pobiera szczegóły pojedynczej odznaki z postępem
 */
export const getBadgeWithProgress = async (
  badgeId,
  userCounters,
  userEarnedBadges,
) => {
  try {
    const badgeRef = doc(db, "badgeTemplates", badgeId);
    const badgeSnap = await getDoc(badgeRef);

    if (!badgeSnap.exists()) {
      return null;
    }

    const template = { id: badgeSnap.id, ...badgeSnap.data() };
    const templates = { [badgeId]: template };

    const progress = calculateBadgeProgress(
      userCounters,
      userEarnedBadges,
      templates,
    );
    return progress[0] || null;
  } catch (error) {
    console.error("Error fetching badge with progress:", error);
    return null;
  }
};

/**
 * Pobiera ostatnie 3 odznaki do wyświetlenia na profilu
 * Sortuje po timestamp zdobycia, jeśli nie ma to po najbliższym level up
 */
export const getRecentBadgesForProfile = (badgeProgress, userEarnedBadges) => {
  // Zdobyte odznaki posortowane po timestamp
  const earnedBadges = badgeProgress
    .filter((badge) => badge.isEarned)
    .map((badge) => ({
      ...badge,
      unlockedAt: userEarnedBadges[badge.id]?.unlockedAt || null,
    }))
    .sort((a, b) => {
      // Sortuj po timestamp, najnowsze pierwsze
      if (a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt) - new Date(a.unlockedAt);
      }
      // Jeśli nie ma timestamp, sortuj po poziomie (wyższy poziom = nowszy)
      return b.currentLevel - a.currentLevel;
    });

  // Odznaki w trakcie zdobywania posortowane po postępie (najbliższe levelup)
  const inProgressBadges = badgeProgress
    .filter((badge) => !badge.isEarned && badge.currentCount > 0)
    .sort((a, b) => b.progress - a.progress); // Najwyższy postęp pierwszy

  // Łącz: zdobyte + w trakcie, ale max 3
  const combined = [...earnedBadges, ...inProgressBadges];
  return combined.slice(0, 3);
};
