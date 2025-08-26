/**
 * Przykłady użycia Firebase Functions dla Activity Feed
 *
 * Ten plik zawiera przykładowe sposoby użycia Cloud Functions
 * do zarządzania feedem aktywności klasy.
 */

import {
  createActivityFeedItem,
  createBulkActivityFeedItems,
  createSampleFeedData,
  clearSampleFeedData,
  addEcoActionFeedItemViaFunction,
  addChallengeFeedItemViaFunction,
  addBadgeFeedItemViaFunction,
} from "./activityFeedCloudService";

// Przykład 1: Dodawanie pojedynczego wpisu do feedu
export async function exampleCreateSingleFeedItem() {
  try {
    const result = await createActivityFeedItem(
      "klasa_4a_uid", // ID klasy
      "Anna Kowalska", // Imię ucznia
      "wykonała EkoDziałanie", // Akcja
      "Segregacja śmieci", // Szczegóły
      "ecoAction", // Typ
    );

    console.log("Wpis utworzony:", result);
    return result;
  } catch (error) {
    console.error("Błąd:", error);
    throw error;
  }
}

// Przykład 2: Dodawanie wielu wpisów jednocześnie
export async function exampleCreateBulkFeedItems() {
  const classId = "klasa_4a_uid";

  const activities = [
    {
      studentName: "Paweł Nowak",
      action: "wykonał EkoDziałanie",
      detail: "Przyjazd rowerem do szkoły",
      type: "ecoAction",
    },
    {
      studentName: "Maria Kowalska",
      action: "ukończyła EkoWyzwanie",
      detail: "Tydzień bez plastiku",
      type: "challenge",
    },
    {
      studentName: "Tomasz Zieliński",
      action: "otrzymał odznakę",
      detail: "Eco Warrior 🌱",
      type: "badge",
    },
  ];

  try {
    const result = await createBulkActivityFeedItems(classId, activities);
    console.log(`Utworzono ${result.successfulItems} wpisów`);
    return result;
  } catch (error) {
    console.error("Błąd:", error);
    throw error;
  }
}

// Przykład 3: Pomocnicze funkcje dla konkretnych typów aktywności
export async function exampleHelperFunctions() {
  const classId = "klasa_4a_uid";

  try {
    // EkoDziałanie
    await addEcoActionFeedItemViaFunction(
      classId,
      "Kasia Dąbrowska",
      "Oszczędzanie wody",
    );

    // EkoWyzwanie
    await addChallengeFeedItemViaFunction(
      classId,
      "Michał Lewandowski",
      "Eco Transport Challenge",
    );

    // Odznaka
    await addBadgeFeedItemViaFunction(
      classId,
      "Agnieszka Wiśniewska",
      "Green Champion 🏆",
    );

    console.log("Wszystkie wpisy utworzone!");
  } catch (error) {
    console.error("Błąd:", error);
    throw error;
  }
}

// Przykład 4: Automatyczne tworzenie feedu po wykonaniu akcji
export async function onEcoActionCompleted(ecoActionData) {
  const { classId, studentName, actionName, studentId } = ecoActionData;

  try {
    // Utwórz wpis w feedzie
    const feedResult = await addEcoActionFeedItemViaFunction(
      classId,
      studentName,
      actionName,
    );

    console.log("Feed wpis utworzony:", feedResult.feedItemId);

    // Opcjonalnie: powiadom innych uczniów, zaktualizuj statystyki, itp.
    // await notifyClassmates(classId, studentId, actionName);
    // await updateClassStatistics(classId);

    return feedResult;
  } catch (error) {
    console.error("Błąd podczas tworzenia wpisu feedu:", error);
    // W przypadku błędu, akcja nadal powinna być zapisana
    // ale bez wpisu w feedzie
    return null;
  }
}

// Przykład 5: Tworzenie i czyszczenie danych testowych
export async function exampleManageTestData() {
  const classId = "klasa_test_uid";

  try {
    // Utwórz przykładowe dane
    console.log("Tworzę przykładowe dane...");
    const createResult = await createSampleFeedData(classId);
    console.log(`Utworzono ${createResult.createdItems} wpisów testowych`);

    // Poczekaj chwilę...
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Wyczyść przykładowe dane
    console.log("Czyszczę przykładowe dane...");
    const clearResult = await clearSampleFeedData(classId);
    console.log(`Usunięto ${clearResult.deletedItems} wpisów testowych`);

    return { createResult, clearResult };
  } catch (error) {
    console.error("Błąd podczas zarządzania danymi testowymi:", error);
    throw error;
  }
}

// Przykład 6: Obsługa błędów i retry
export async function exampleErrorHandling() {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const result = await createActivityFeedItem(
        "klasa_4a_uid",
        "Test User",
        "wykonał test",
        "Test retry mechanism",
        "general",
      );

      console.log("Sukces za próbą:", attempts + 1);
      return result;
    } catch (error) {
      attempts++;
      console.warn(`Próba ${attempts} nieudana:`, error.message);

      if (attempts >= maxRetries) {
        console.error("Wyczerpano wszystkie próby");
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      console.log(`Czekam ${delay}ms przed kolejną próbą...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Przykład 7: Batch processing większych ilości danych
export async function exampleBatchProcessing() {
  const classId = "klasa_4a_uid";

  // Symulacja dużej ilości danych
  const allActivities = [];
  for (let i = 1; i <= 125; i++) {
    allActivities.push({
      studentName: `Uczeń ${i}`,
      action: "wykonał EkoDziałanie",
      detail: `Akcja nr ${i}`,
      type: "ecoAction",
    });
  }

  console.log(`Przetwarzam ${allActivities.length} aktywności...`);

  // Podziel na batche po 50 (limit Cloud Function)
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < allActivities.length; i += batchSize) {
    batches.push(allActivities.slice(i, i + batchSize));
  }

  console.log(`Utworzono ${batches.length} batchy`);

  const results = [];
  for (let i = 0; i < batches.length; i++) {
    try {
      console.log(`Przetwarzam batch ${i + 1}/${batches.length}...`);
      const result = await createBulkActivityFeedItems(classId, batches[i]);
      results.push(result);

      // Krótka pauza między batchami
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Błąd w batch ${i + 1}:`, error);
      results.push({ error: error.message, batchIndex: i });
    }
  }

  const totalSuccess = results.reduce((sum, result) => {
    return sum + (result.successfulItems || 0);
  }, 0);

  console.log(`Przetworzono łącznie ${totalSuccess} aktywności`);
  return results;
}

// Przykład 8: Integracja z innymi serwisami
export async function exampleIntegrationWithOtherServices() {
  const classId = "klasa_4a_uid";
  const studentId = "student_123";
  const studentName = "Anna Kowalska";

  try {
    // 1. Uczeń wykonuje EkoDziałanie
    const ecoAction = await submitEcoAction(studentId, "Segregacja śmieci");

    // 2. Dodaj wpis do feedu
    await addEcoActionFeedItemViaFunction(classId, studentName, ecoAction.name);

    // 3. Sprawdź czy uczeń zasługuje na nową odznakę
    const newBadge = await checkForNewBadge(studentId);
    if (newBadge) {
      await addBadgeFeedItemViaFunction(classId, studentName, newBadge.name);
    }

    // 4. Zaktualizuj statystyki klasy
    await updateClassStatistics(classId);

    console.log("Cały proces zakończony pomyślnie!");
  } catch (error) {
    console.error("Błąd w procesie integracji:", error);
    throw error;
  }
}

// Pomocnicze funkcje do przykładu 8 (mock)
async function submitEcoAction(studentId, actionName) {
  // Mock implementation
  return { id: "action_123", name: actionName };
}

async function checkForNewBadge(studentId) {
  // Mock implementation
  return Math.random() > 0.7 ? { name: "New Badge 🏅" } : null;
}

async function updateClassStatistics(classId) {
  // Mock implementation
  console.log(`Statystyki klasy ${classId} zaktualizowane`);
}

export default {
  exampleCreateSingleFeedItem,
  exampleCreateBulkFeedItems,
  exampleHelperFunctions,
  onEcoActionCompleted,
  exampleManageTestData,
  exampleErrorHandling,
  exampleBatchProcessing,
  exampleIntegrationWithOtherServices,
};
