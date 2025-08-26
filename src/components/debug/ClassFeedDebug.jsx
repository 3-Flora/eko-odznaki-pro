import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  createSampleFeedData,
  getClassActivityFeed,
} from "../../services/activityFeedService";
import {
  createSampleFeedData as createSampleFeedDataViaFunction,
  clearSampleFeedData,
  createActivityFeedItem,
} from "../../services/activityFeedCloudService";
import {
  Rss,
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
  Cloud,
  Zap,
} from "lucide-react";

export default function ClassFeedDebug() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [feedItems, setFeedItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Przykładowe dane do dodania do feedu
  const sampleFeedItems = [
    {
      studentName: "Anna Kowalska",
      action: "wykonała EkoDziałanie",
      detail: "Segregacja śmieci",
      type: "ecoAction",
    },
    {
      studentName: "Paweł Nowak",
      action: "ukończyła EkoWyzwanie",
      detail: "Tydzień bez plastiku",
      type: "challenge",
    },
    {
      studentName: "Maria Wiśniewska",
      action: "otrzymała odznakę",
      detail: "Eco Warrior 🌱",
      type: "badge",
    },
    {
      studentName: "Tomasz Zieliński",
      action: "wykonał EkoDziałanie",
      detail: "Przyjazd rowerem do szkoły",
      type: "ecoAction",
    },
    {
      studentName: "Kasia Dąbrowska",
      action: "wykonała EkoDziałanie",
      detail: "Oszczędzanie wody",
      type: "ecoAction",
    },
    {
      studentName: "Michał Lewandowski",
      action: "otrzymał odznakę",
      detail: "Green Champion 🏆",
      type: "badge",
    },
  ];

  const addSampleFeedData = async () => {
    if (!currentUser?.classId) {
      setMessage("❌ Musisz być przypisany do klasy");
      return;
    }

    setLoading(true);
    setMessage("Dodaję przykładowe dane do feedu klasy...");

    try {
      const successCount = await createSampleFeedData(currentUser.classId);
      setMessage(
        `✅ Dodano ${successCount} przykładowych wpisów do feedu klasy`,
      );
      // Odśwież listę po dodaniu
      fetchFeedData();
    } catch (error) {
      console.error("Błąd podczas dodawania danych do feedu:", error);
      setMessage("❌ Błąd podczas dodawania danych do feedu");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedData = async () => {
    if (!currentUser?.classId) {
      setMessage("❌ Musisz być przypisany do klasy");
      return;
    }

    setLoadingFeed(true);
    try {
      const items = await getClassActivityFeed(currentUser.classId, 10);
      setFeedItems(items);
    } catch (error) {
      console.error("Błąd podczas pobierania feedu:", error);
      setMessage("❌ Błąd podczas pobierania feedu");
    } finally {
      setLoadingFeed(false);
    }
  };

  // Nowe funkcje Cloud Functions
  const addSampleFeedDataViaFunction = async () => {
    if (!currentUser?.classId) {
      setMessage("❌ Musisz być przypisany do klasy");
      return;
    }

    setLoading(true);
    setMessage("Dodaję przykładowe dane przez Cloud Functions...");

    try {
      const result = await createSampleFeedDataViaFunction(currentUser.classId);
      setMessage(`✅ Cloud Function: ${result.message}`);
      // Odśwież listę po dodaniu
      fetchFeedData();
    } catch (error) {
      console.error("Błąd podczas wywołania Cloud Function:", error);
      setMessage(`❌ Błąd Cloud Function: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSampleFeedDataViaFunction = async () => {
    if (!currentUser?.classId) {
      setMessage("❌ Musisz być przypisany do klasy");
      return;
    }

    setLoading(true);
    setMessage("Czyszczę przykładowe dane przez Cloud Functions...");

    try {
      const result = await clearSampleFeedData(currentUser.classId);
      setMessage(`✅ Cloud Function: ${result.message}`);
      // Odśwież listę po wyczyszczeniu
      fetchFeedData();
    } catch (error) {
      console.error("Błąd podczas wywołania Cloud Function:", error);
      setMessage(`❌ Błąd Cloud Function: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addSingleFeedItemViaFunction = async () => {
    if (!currentUser?.classId) {
      setMessage("❌ Musisz być przypisany do klasy");
      return;
    }

    setLoading(true);
    setMessage("Dodaję pojedynczy wpis przez Cloud Functions...");

    try {
      const result = await createActivityFeedItem(
        currentUser.classId,
        currentUser.displayName || "Test User",
        "przetestował funkcję",
        "Cloud Functions działają!",
        "general",
      );
      setMessage(`✅ Cloud Function: ${result.message}`);
      // Odśwież listę po dodaniu
      fetchFeedData();
    } catch (error) {
      console.error("Błąd podczas wywołania Cloud Function:", error);
      setMessage(`❌ Błąd Cloud Function: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "ecoAction":
        return "🌱";
      case "challenge":
        return "🏆";
      case "badge":
        return "🏅";
      default:
        return "📝";
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case "ecoAction":
        return "bg-green-500";
      case "challenge":
        return "bg-blue-500";
      case "badge":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
          <Rss className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Debug Feed Klasy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zarządzanie feedem aktywności klasy
          </p>
        </div>
      </div>

      {/* Info o klasie */}
      {currentUser?.classId && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Klasa: {currentUser.classId}
            </span>
          </div>
        </div>
      )}

      {/* Przyciski akcji - lokalne */}
      <div className="mb-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          🔧 Funkcje lokalne (Firestore)
        </h3>
        <div className="space-y-3">
          <button
            onClick={addSampleFeedData}
            disabled={loading || !currentUser?.classId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Dodawanie..." : "Dodaj przykładowe dane (lokalnie)"}
          </button>

          <button
            onClick={fetchFeedData}
            disabled={loadingFeed || !currentUser?.classId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            <Rss className="h-4 w-4" />
            {loadingFeed ? "Ładowanie..." : "Pobierz aktualny feed"}
          </button>
        </div>
      </div>

      {/* Przyciski akcji - Cloud Functions */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          ☁️ Cloud Functions
        </h3>
        <div className="space-y-3">
          <button
            onClick={addSampleFeedDataViaFunction}
            disabled={loading || !currentUser?.classId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
          >
            <Cloud className="h-4 w-4" />
            {loading
              ? "Wywołuję..."
              : "Dodaj przykładowe dane (Cloud Function)"}
          </button>

          <button
            onClick={addSingleFeedItemViaFunction}
            disabled={loading || !currentUser?.classId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {loading ? "Wywołuję..." : "Dodaj pojedynczy wpis (Cloud Function)"}
          </button>

          <button
            onClick={clearSampleFeedDataViaFunction}
            disabled={loading || !currentUser?.classId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            <AlertCircle className="h-4 w-4" />
            {loading
              ? "Czyszczę..."
              : "Wyczyść przykładowe dane (Cloud Function)"}
          </button>
        </div>
      </div>

      {/* Komunikaty */}
      {message && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div className="flex items-center gap-2 text-sm">
            {message.startsWith("✅") && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {message.startsWith("❌") && (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-gray-700 dark:text-gray-300">{message}</span>
          </div>
        </div>
      )}

      {/* Aktualny feed */}
      {feedItems.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-800 dark:text-white">
            <Rss className="h-4 w-4" />
            Aktualny feed klasy ({feedItems.length} wpisów)
          </h3>
          <div className="space-y-3">
            {feedItems.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${getActionColor(item.type)}`}
                >
                  {getActionIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800 dark:text-white">
                    {item.text}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-400">
                    {item.timestamp
                      ? new Date(item.timestamp.toDate()).toLocaleString(
                          "pl-PL",
                        )
                      : "Brak daty"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Podgląd przykładowych danych */}
      <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <h4 className="mb-3 font-medium text-yellow-800 dark:text-yellow-200">
          📋 Przykładowe dane do dodania:
        </h4>
        <div className="space-y-2">
          {sampleFeedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{getActionIcon(item.type)}</span>
              <span className="text-yellow-700 dark:text-yellow-300">
                {item.studentName} {item.action}: {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
