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
    style: {
      color: "yellow",
      shape: "circle",
    },
  },
  "segregacja-odpadow": {
    name: "Segregacja odpadów",
    description: "Prawidłowo segreguj odpady w domu i szkole",
    category: "Recykling",
    counterToIncrement: "recyclingActions",
    style: {
      color: "green",
      shape: "square",
    },
  },
  "oszczedzanie-wody": {
    name: "Oszczędzanie wody",
    description: "Zamykaj kran podczas mycia zębów",
    category: "Oszczędzanie",
    counterToIncrement: "savingActions",
    style: {
      color: "blue",
      shape: "circle",
    },
  },
  "nauka-o-srodowisku": {
    name: "Nauka o środowisku",
    description: "Przeczytaj artykuł o ochronie środowiska",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    style: {
      color: "purple",
      shape: "triangle",
    },
  },
  "uzycie-transportu-publicznego": {
    name: "Transport publiczny",
    description: "Jedź autobusem lub tramwajem zamiast samochodem",
    category: "Oszczędzanie",
    counterToIncrement: "savingActions",
    style: {
      color: "orange",
      shape: "circle",
    },
  },
  "sadzenie-roslin": {
    name: "Sadzenie roślin",
    description: "Posadź roślinę w domu lub ogrodzie",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    style: {
      color: "green",
      shape: "square",
    },
  },
  "zbieranie-makulatury": {
    name: "Zbieranie makulatury",
    description: "Zbierz starą papier do recyklingu",
    category: "Recykling",
    counterToIncrement: "recyclingActions",
    style: {
      color: "brown",
      shape: "square",
    },
  },
  "eco-warsztaty": {
    name: "EkoWarsztaty",
    description: "Weź udział w warsztatach ekologicznych",
    category: "Edukacja",
    counterToIncrement: "educationActions",
    style: {
      color: "teal",
      shape: "circle",
    },
  },
};

// Przykładowe szablony EkoWyzwań
export const challengeTemplatesData = {
  "nakretkowy-challenge": {
    name: "Nakrętkowy Challenge",
    description: "Zbieraj nakrętki przez cały tydzień",
    category: "Recykling",
  },
  "tydzien-bez-plastiku": {
    name: "Tydzień bez plastiku",
    description:
      "Spróbuj przez tydzień unikać produktów w plastikowych opakowaniach",
    category: "Oszczędzanie",
  },
  "eko-lunch-challenge": {
    name: "EkoLunch Challenge",
    description: "Przynoś ekologiczny lunch bez jednorazowych opakowań",
    category: "Oszczędzanie",
  },
  "quiz-ekologiczny": {
    name: "Quiz ekologiczny",
    description: "Rozwiąż quiz o ekologii i środowisku",
    category: "Edukacja",
  },
  "zielony-transport": {
    name: "Zielony transport",
    description:
      "Przez tydzień korzystaj tylko z ekologicznych środków transportu",
    category: "Oszczędzanie",
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

export const addChallengeTemplatesToFirestore = async () => {
  try {
    const results = [];
    for (const [id, data] of Object.entries(challengeTemplatesData)) {
      const docRef = doc(db, "challengeTemplates", id);
      await setDoc(docRef, data);
      results.push(`✅ Dodano EkoWyzwanie: ${data.name}`);
    }
    return results;
  } catch (error) {
    console.error("Error adding challenge templates:", error);
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
