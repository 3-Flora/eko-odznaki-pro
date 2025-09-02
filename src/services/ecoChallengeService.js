import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Pobiera wszystkie przypisane EkoWyzwania
 */
export const getAllEcoChallenges = async () => {
  try {
    const ecoChallengesRef = collection(db, "ecoChallenges");
    const snapshot = await getDocs(ecoChallengesRef);

    const ecoChallenges = [];
    snapshot.docs.forEach((doc) => {
      ecoChallenges.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // for (const docSnapshot of snapshot.docs) {
    //   const assignedData = docSnapshot.data();

    //   // Pobierz dane szablonu wyzwania
    //   let templateData = null;
    //   if (assignedData.templateId) {
    //     try {
    //       const templateRef = doc(
    //         db,
    //         "challengeTemplates",
    //         assignedData.templateId,
    //       );
    //       const templateSnap = await getDoc(templateRef);
    //       if (templateSnap.exists()) {
    //         templateData = templateSnap.data();
    //       }
    //     } catch (error) {
    //       console.error("Error fetching challenge template:", error);
    //     }
    //   }

    //   // Połącz dane przypisanego wyzwania z danymi szablonu
    //   ecoChallenges.push({
    //     id: docSnapshot.id,
    //     ...assignedData,
    //     // Dane z szablonu mają pierwszeństwo, ale możemy je nadpisać
    //     name:
    //       assignedData.challengeName ||
    //       templateData?.name ||
    //       "Nieznane wyzwanie",
    //     description:
    //       assignedData.challengeDescription || templateData?.description || "",
    //     category: templateData?.category || "Inne",
    //     templateData: templateData, // Zachowaj oryginalne dane szablonu
    //   });
    // }

    console.log(ecoChallenges);
    return ecoChallenges;
  } catch (error) {
    console.error("Error fetching eco challenges:", error);
    return [];
  }
};

/**
 * Pobiera aktywne wyzwania (między startDate a endDate)
 * Wszystkie klasy mają teraz takie same aktywne wyzwania
 */
export const getEcoChallenges = async () => {
  try {
    const allChallenges = await getAllEcoChallenges();
    const now = new Date();

    return allChallenges.filter((challenge) => {
      if (!challenge.startDate || !challenge.endDate) {
        return true;
        // Jeśli nie ma dat, traktuj jako zawsze aktywne
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
export const groupEcoChallengesByCategory = (challenges) => {
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
export const getEcoChallengeCategoryStats = (challenges) => {
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

/**
 * Pobiera aktywne wyzwanie dla ucznia (obecnie trwające)
 * @returns {Promise<Object|null>} - Aktywne wyzwanie lub null jeśli brak
 */
export const getActiveEcoChallenge = async () => {
  try {
    const now = new Date();
    const q = query(
      collection(db, "ecoChallenges"),
      orderBy("endDate", "desc"),
      limit(5),
    );

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Znajdź aktywne (startDate <= now <= endDate)
    const active = items.find((item) => {
      const start = item.startDate
        ? item.startDate.toDate?.() || new Date(item.startDate)
        : new Date(0);
      const end = item.endDate
        ? item.endDate.toDate?.() || new Date(item.endDate)
        : new Date(0);
      return start <= now && now <= end;
    });

    return active || null;
  } catch (error) {
    console.error("Error fetching active eco challenge:", error);
    return null;
  }
};
