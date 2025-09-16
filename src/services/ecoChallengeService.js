import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
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

/**
 * Tworzy nowe EkoWyzwanie
 * @param {Object} challengeData - Dane wyzwania zgodne ze strukturą bazy danych
 * @returns {Promise<string>} - ID utworzonego wyzwania
 */
export const createEcoChallenge = async (challengeData) => {
  try {
    const docRef = await addDoc(collection(db, "ecoChallenges"), {
      ...challengeData,
      createdAt: serverTimestamp(),
      isActive: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating eco challenge:", error);
    throw error;
  }
};

/**
 * Pobiera pojedyncze EkoWyzwanie po ID
 * @param {string} challengeId - ID wyzwania
 * @returns {Promise<Object|null>} - Dane wyzwania lub null jeśli nie istnieje
 */
export const getEcoChallengeById = async (challengeId) => {
  try {
    const docRef = doc(db, "ecoChallenges", challengeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching eco challenge:", error);
    throw error;
  }
};

/**
 * Aktualizuje istniejące EkoWyzwanie
 * @param {string} challengeId - ID wyzwania do aktualizacji
 * @param {Object} updateData - Dane do aktualizacji
 * @returns {Promise<void>}
 */
export const updateEcoChallenge = async (challengeId, updateData) => {
  try {
    const docRef = doc(db, "ecoChallenges", challengeId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating eco challenge:", error);
    throw error;
  }
};

/**
 * Usuwa EkoWyzwanie
 * @param {string} challengeId - ID wyzwania do usunięcia
 * @returns {Promise<void>}
 */
export const deleteEcoChallenge = async (challengeId) => {
  try {
    await deleteDoc(doc(db, "ecoChallenges", challengeId));
  } catch (error) {
    console.error("Error deleting eco challenge:", error);
    throw error;
  }
};

/**
 * Waliduje dane EkoWyzwania
 * @param {Object} challengeData - Dane do walidacji
 * @returns {Object} - Obiekt z błędami walidacji lub pusty jeśli brak błędów
 */
export const validateEcoChallengeData = (challengeData) => {
  const errors = {};

  if (!challengeData.name || challengeData.name.trim().length === 0) {
    errors.name = "Nazwa wyzwania jest wymagana";
  }

  if (
    !challengeData.description ||
    challengeData.description.trim().length === 0
  ) {
    errors.description = "Opis wyzwania jest wymagany";
  }

  if (!challengeData.category || challengeData.category.trim().length === 0) {
    errors.category = "Kategoria jest wymagana";
  }

  if (!challengeData.startDate) {
    errors.startDate = "Data rozpoczęcia jest wymagana";
  }

  if (!challengeData.endDate) {
    errors.endDate = "Data zakończenia jest wymagana";
  }

  if (challengeData.startDate && challengeData.endDate) {
    const start = new Date(challengeData.startDate);
    const end = new Date(challengeData.endDate);

    if (start >= end) {
      errors.endDate =
        "Data zakończenia musi być późniejsza niż data rozpoczęcia";
    }
  }

  if (
    challengeData.maxDaily &&
    (isNaN(challengeData.maxDaily) || challengeData.maxDaily < 1)
  ) {
    errors.maxDaily = "Limit dzienny musi być liczbą większą od 0";
  }

  if (
    challengeData.maxWeekly &&
    (isNaN(challengeData.maxWeekly) || challengeData.maxWeekly < 1)
  ) {
    errors.maxWeekly = "Limit tygodniowy musi być liczbą większą od 0";
  }

  return errors;
};
