import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

// Przykładowe szablony EkoDziałań zgodne ze strukturą bazy danych
export const ecoActionsData = {
  "gaszenie-swiatla": {
    name: "Gaszenie światła",
    description: "Pamiętaj, aby gasić światło wychodząc z pokoju",
    category: "Oszczędzanie",
    counterToIncrement: "savingActions",
    maxDaily: 3,
    maxWeekly: 10,
    style: {
      color: "yellow",
      shape: "circle",
      icon: "💡",
    },
  },
  "segregacja-odpadow": {
    name: "Segregacja odpadów",
    description: "Prawidłowo segreguj odpady w domu i szkole",
    category: "Recykling",
    counterToIncrement: "recyclingActions",
    maxDaily: 2,
    maxWeekly: 7,
    style: {
      color: "green",
      shape: "square",
      icon: "♻️",
    },
  },
  "oszczedzanie-wody": {
    name: "Oszczędzanie wody",
    description: "Zamykaj kran podczas mycia zębów",
    category: "Oszczędzanie",
    counterToIncrement: "savingActions",
    maxDaily: 5,
    maxWeekly: 15,
    style: {
      color: "blue",
      shape: "circle",
      icon: "💧",
    },
  },
  "nauka-o-srodowisku": {
    name: "Nauka o środowisku",
    description: "Przeczytaj artykuł o ochronie środowiska",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    maxDaily: 1,
    maxWeekly: 3,
    style: {
      color: "purple",
      shape: "triangle",
      icon: "📚",
    },
  },
  "uzycie-transportu-publicznego": {
    name: "Transport publiczny",
    description: "Jedź autobusem lub tramwajem zamiast samochodem",
    category: "Oszczędzanie",
    counterToIncrement: "savingActions",
    maxDaily: 1,
    maxWeekly: 5,
    style: {
      color: "orange",
      shape: "circle",
      icon: "🚌",
    },
  },
  "sadzenie-roslin": {
    name: "Sadzenie roślin",
    description: "Posadź roślinę w domu lub ogrodzie",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    maxDaily: 1,
    maxWeekly: 5,
    style: {
      color: "green",
      shape: "square",
      icon: "🌱",
    },
  },
  "zbieranie-makulatury": {
    name: "Zbieranie makulatury",
    description: "Zbierz starą papier do recyklingu",
    category: "Recykling",
    counterToIncrement: "recyclingActions",
    maxDaily: 1,
    maxWeekly: 5,
    style: {
      color: "brown",
      shape: "square",
      icon: "📦",
    },
  },
  "eco-warsztaty": {
    name: "EkoWarsztaty",
    description: "Weź udział w warsztatach ekologicznych",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    maxDaily: 1,
    maxWeekly: 5,
    style: {
      color: "teal",
      shape: "circle",
      icon: "🌱",
    },
  },
};

/**
 * Funkcje do masowego dodawania danych do Firestore
 */
export const addEcoActionsToFirestore = async () => {
  try {
    const results = [];
    for (const [id, data] of Object.entries(ecoActionsData)) {
      const docRef = doc(db, "ecoActions", id);
      await setDoc(docRef, data);
      results.push(`✅ Dodano EkoDziałań: ${data.name}`);
    }
    return results;
  } catch (error) {
    console.error("Error adding eco actions:", error);
    throw error;
  }
};

export const clearCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const results = [];

    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      results.push(`🗑️ Usunięto: ${docSnapshot.id}`);
    }

    return results;
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
    throw error;
  }
};
