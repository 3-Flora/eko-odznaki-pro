import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Pobiera statystyki klasy dla nauczyciela
 * @param {string} classId - ID klasy
 * @returns {Promise<Object>} - Statystyki klasy i informacje o szkole
 */
export const getTeacherClassStats = async (classId) => {
  try {
    // Pobierz informacje o klasie
    const classDoc = await getDoc(doc(db, "classes", classId));
    let className = "";
    let schoolName = "";

    if (classDoc.exists()) {
      const classData = classDoc.data();
      className = classData.name || "";

      // Pobierz informacje o szkole
      if (classData.schoolId) {
        const schoolDoc = await getDoc(doc(db, "schools", classData.schoolId));
        if (schoolDoc.exists()) {
          schoolName = schoolDoc.data().name || "";
        }
      }
    }

    // Pobierz uczniów z tej klasy
    const studentsQuery = query(
      collection(db, "users"),
      where("classId", "==", classId),
      where("role", "==", "student"),
      where("isVerified", "==", true),
    );

    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Oblicz statystyki klasy
    const classStats = students.reduce(
      (acc, student) => {
        const counters = student.counters || {};
        return {
          totalActions: acc.totalActions + (counters.totalActions || 0),
          totalChallenges:
            acc.totalChallenges + (counters.totalChallenges || 0),
          totalActiveDays:
            acc.totalActiveDays + (counters.totalActiveDays || 0),
          recyclingActions:
            acc.recyclingActions + (counters.recyclingActions || 0),
          educationActions:
            acc.educationActions + (counters.educationActions || 0),
          savingActions: acc.savingActions + (counters.savingActions || 0),
          transportActions:
            acc.transportActions + (counters.transportActions || 0),
          energyActions: acc.energyActions + (counters.energyActions || 0),
          foodActions: acc.foodActions + (counters.foodActions || 0),
        };
      },
      {
        totalActions: 0,
        totalChallenges: 0,
        totalActiveDays: 0,
        recyclingActions: 0,
        educationActions: 0,
        savingActions: 0,
        transportActions: 0,
        energyActions: 0,
        foodActions: 0,
      },
    );

    return {
      classStats,
      studentsCount: students.length,
      className,
      schoolName,
    };
  } catch (error) {
    console.error("Error fetching teacher class stats:", error);
    throw error;
  }
};

/**
 * Pobiera liczby oczekujących weryfikacji dla nauczyciela
 * @param {string} classId - ID klasy
 * @returns {Promise<Object>} - Liczby oczekujących weryfikacji
 */
export const getPendingVerifications = async (classId) => {
  try {
    // Pobierz oczekujące zgłoszenia
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("classId", "==", classId),
      where("status", "in", ["pending", null]),
      limit(50),
    );

    const submissionsSnapshot = await getDocs(submissionsQuery);
    const pendingSubmissions = submissionsSnapshot.docs.length;

    // Pobierz niezweryfikowanych uczniów
    const studentsQuery = query(
      collection(db, "users"),
      where("classId", "==", classId),
      where("role", "==", "student"),
      where("isVerified", "!=", true),
    );

    const studentsSnapshot = await getDocs(studentsQuery);
    const pendingStudents = studentsSnapshot.docs.length;

    return {
      pendingSubmissions,
      pendingStudents,
    };
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    throw error;
  }
};

/**
 * Pobiera informacje o klasie
 * @param {string} classId - ID klasy
 * @returns {Promise<Object>} - Informacje o klasie i szkole
 */
export const getClassInfo = async (classId) => {
  try {
    const classDoc = await getDoc(doc(db, "classes", classId));

    if (!classDoc.exists()) {
      throw new Error("Klasa nie istnieje");
    }

    const classData = classDoc.data();
    let schoolName = "";

    if (classData.schoolId) {
      const schoolDoc = await getDoc(doc(db, "schools", classData.schoolId));
      if (schoolDoc.exists()) {
        schoolName = schoolDoc.data().name || "";
      }
    }

    return {
      id: classDoc.id,
      ...classData,
      schoolName,
    };
  } catch (error) {
    console.error("Error fetching class info:", error);
    throw error;
  }
};
