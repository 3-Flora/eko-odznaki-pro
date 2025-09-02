import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Serwis do zarządzania powiadomieniami w aplikacji EkoOdznaki
 */

/**
 * Tworzy nowe powiadomienie
 * @param {Object} notificationData - Dane powiadomienia
 * @param {string} notificationData.title - Tytuł powiadomienia
 * @param {string} notificationData.message - Treść powiadomienia
 * @param {string} notificationData.createdBy - UID nadawcy
 * @param {string} notificationData.type - Typ: "info" | "alert" | "reminder"
 * @param {boolean} notificationData.isGlobal - Czy powiadomienie globalne
 * @param {Object} notificationData.target - Docelowi odbiorcy (opcjonalne)
 * @param {string} notificationData.target.role - "student" | "teacher" | "all"
 * @param {string} notificationData.target.schoolId - ID szkoły (opcjonalne)
 * @param {string} notificationData.target.classId - ID klasy (opcjonalne)
 * @param {string} notificationData.target.userId - ID użytkownika (opcjonalne)
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      title: notificationData.title,
      message: notificationData.message,
      createdAt: serverTimestamp(),
      createdBy: notificationData.createdBy,
      type: notificationData.type || "info",
      isGlobal: notificationData.isGlobal || false,
      target: notificationData.target || null,
      readBy: [], // Lista użytkowników, którzy przeczytali
    };

    const docRef = await addDoc(collection(db, "notifications"), notification);
    console.log("✅ Powiadomienie utworzone z ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Błąd podczas tworzenia powiadomienia:", error);
    throw error;
  }
};

/**
 * Pobiera powiadomienia dla konkretnego użytkownika
 * Zoptymalizowana wersja - pobiera wszystkie powiadomienia i filtruje po stronie klienta
 * @param {string} userId - ID użytkownika
 * @param {string} userRole - Rola użytkownika ("student" | "teacher" | "ekoskop")
 * @param {string} schoolId - ID szkoły użytkownika (opcjonalne)
 * @param {string} classId - ID klasy użytkownika (opcjonalne)
 * @param {number} limitCount - Limit powiadomień (domyślnie 50)
 * @returns {Promise<Array>} - Lista powiadomień
 */
export const getUserNotifications = async (
  userId,
  userRole,
  schoolId = null,
  classId = null,
  limitCount = 50,
) => {
  try {
    const notificationsRef = collection(db, "notifications");

    // Pojedyncze zapytanie - pobierz wszystkie powiadomienia posortowane po dacie
    // Zwiększamy limit żeby po filtrowaniu mieć wystarczająco powiadomień
    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(limitCount * 3), // Pobieramy więcej, żeby po filtrowaniu mieć wystarczająco
    );

    const snapshot = await getDocs(q);
    const notifications = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Sprawdź czy powiadomienie jest odpowiednie dla użytkownika
      if (isNotificationForUser(data, userId, userRole, schoolId, classId)) {
        notifications.push({
          id: doc.id,
          ...data,
          isRead: data.readBy?.includes(userId) || false,
        });
      }
    });

    // Posortuj i ogranicz do żądanej liczby
    return notifications
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error("❌ Błąd podczas pobierania powiadomień:", error);
    return [];
  }
};

/**
 * Sprawdza czy powiadomienie jest przeznaczone dla danego użytkownika
 * @param {Object} notification - Dane powiadomienia
 * @param {string} userId - ID użytkownika
 * @param {string} userRole - Rola użytkownika
 * @param {string} schoolId - ID szkoły użytkownika
 * @param {string} classId - ID klasy użytkownika
 * @returns {boolean}
 */
const isNotificationForUser = (
  notification,
  userId,
  userRole,
  schoolId,
  classId,
) => {
  // Powiadomienia globalne
  if (notification.isGlobal) {
    return true;
  }

  // Sprawdź target
  if (!notification.target) {
    return false;
  }

  const target = notification.target;

  // Sprawdź konkretnego użytkownika
  if (target.userId && target.userId === userId) {
    return true;
  }

  // Sprawdź rolę
  if (target.role) {
    if (target.role === "all" || target.role === userRole) {
      // Sprawdź dodatowe kryteria (szkołę/klasę)
      if (target.schoolId && target.schoolId !== schoolId) {
        return false;
      }
      if (target.classId && target.classId !== classId) {
        return false;
      }
      return true;
    }
  }

  // Sprawdź klasę (bez sprawdzania roli)
  if (target.classId && target.classId === classId && !target.role) {
    return true;
  }

  // Sprawdź szkołę (bez sprawdzania roli)
  if (
    target.schoolId &&
    target.schoolId === schoolId &&
    !target.role &&
    !target.classId
  ) {
    return true;
  }

  return false;
};

/**
 * Oznacza powiadomienie jako przeczytane
 * @param {string} notificationId - ID powiadomienia
 * @param {string} userId - ID użytkownika
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayUnion(userId),
    });

    console.log("✅ Powiadomienie oznaczone jako przeczytane");
  } catch (error) {
    console.error(
      "❌ Błąd podczas oznaczania powiadomienia jako przeczytane:",
      error,
    );
    throw error;
  }
};

/**
 * Oznacza wiele powiadomień jako przeczytane
 * @param {string[]} notificationIds - Lista ID powiadomień
 * @param {string} userId - ID użytkownika
 * @returns {Promise<void>}
 */
export const markMultipleNotificationsAsRead = async (
  notificationIds,
  userId,
) => {
  try {
    const updatePromises = notificationIds.map((notificationId) => {
      const notificationRef = doc(db, "notifications", notificationId);
      return updateDoc(notificationRef, {
        readBy: arrayUnion(userId),
      });
    });

    await Promise.all(updatePromises);
    console.log("✅ Wiele powiadomień oznaczonych jako przeczytane");
  } catch (error) {
    console.error(
      "❌ Błąd podczas oznaczania powiadomień jako przeczytane:",
      error,
    );
    throw error;
  }
};

/**
 * Pobiera liczbę nieprzeczytanych powiadomień dla użytkownika
 * @param {string} userId - ID użytkownika
 * @param {string} userRole - Rola użytkownika
 * @param {string} schoolId - ID szkoły użytkownika (opcjonalne)
 * @param {string} classId - ID klasy użytkownika (opcjonalne)
 * @returns {Promise<number>} - Liczba nieprzeczytanych powiadomień
 */
export const getUnreadNotificationsCount = async (
  userId,
  userRole,
  schoolId = null,
  classId = null,
) => {
  try {
    const notifications = await getUserNotifications(
      userId,
      userRole,
      schoolId,
      classId,
    );
    return notifications.filter((notification) => !notification.isRead).length;
  } catch (error) {
    console.error(
      "❌ Błąd podczas pobierania liczby nieprzeczytanych powiadomień:",
      error,
    );
    return 0;
  }
};

/**
 * Tworzy powiadomienie dla konkretnej klasy
 * @param {string} title - Tytuł powiadomienia
 * @param {string} message - Treść powiadomienia
 * @param {string} createdBy - UID nadawcy
 * @param {string} classId - ID klasy
 * @param {string} type - Typ powiadomienia (domyślnie "info")
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createClassNotification = async (
  title,
  message,
  createdBy,
  classId,
  type = "info",
) => {
  return createNotification({
    title,
    message,
    createdBy,
    type,
    isGlobal: false,
    target: {
      classId: classId,
    },
  });
};

/**
 * Tworzy powiadomienie dla konkretnej szkoły
 * @param {string} title - Tytuł powiadomienia
 * @param {string} message - Treść powiadomienia
 * @param {string} createdBy - UID nadawcy
 * @param {string} schoolId - ID szkoły
 * @param {string} type - Typ powiadomienia (domyślnie "info")
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createSchoolNotification = async (
  title,
  message,
  createdBy,
  schoolId,
  type = "info",
) => {
  return createNotification({
    title,
    message,
    createdBy,
    type,
    isGlobal: false,
    target: {
      schoolId: schoolId,
    },
  });
};

/**
 * Tworzy globalne powiadomienie
 * @param {string} title - Tytuł powiadomienia
 * @param {string} message - Treść powiadomienia
 * @param {string} createdBy - UID nadawcy
 * @param {string} type - Typ powiadomienia (domyślnie "info")
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createGlobalNotification = async (
  title,
  message,
  createdBy,
  type = "info",
) => {
  return createNotification({
    title,
    message,
    createdBy,
    type,
    isGlobal: true,
  });
};

/**
 * Tworzy powiadomienie dla konkretnego użytkownika
 * @param {string} title - Tytuł powiadomienia
 * @param {string} message - Treść powiadomienia
 * @param {string} createdBy - UID nadawcy
 * @param {string} targetUserId - ID docelowego użytkownika
 * @param {string} type - Typ powiadomienia (domyślnie "info")
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createUserNotification = async (
  title,
  message,
  createdBy,
  targetUserId,
  type = "info",
) => {
  return createNotification({
    title,
    message,
    createdBy,
    type,
    isGlobal: false,
    target: {
      userId: targetUserId,
    },
  });
};

/**
 * Tworzy powiadomienie dla użytkowników o konkretnej roli
 * @param {string} title - Tytuł powiadomienia
 * @param {string} message - Treść powiadomienia
 * @param {string} createdBy - UID nadawcy
 * @param {string} targetRole - Docelowa rola ("student" | "teacher" | "all")
 * @param {string} schoolId - ID szkoły (opcjonalne)
 * @param {string} classId - ID klasy (opcjonalne)
 * @param {string} type - Typ powiadomienia (domyślnie "info")
 * @returns {Promise<string>} - ID utworzonego powiadomienia
 */
export const createRoleNotification = async (
  title,
  message,
  createdBy,
  targetRole,
  schoolId = null,
  classId = null,
  type = "info",
) => {
  return createNotification({
    title,
    message,
    createdBy,
    type,
    isGlobal: false,
    target: {
      role: targetRole,
      schoolId,
      classId,
    },
  });
};
