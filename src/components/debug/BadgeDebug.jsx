import { useState } from "react";
import {
  initializeBadgeTemplates,
  getTestUserCounters,
} from "../../data/badgeTemplates";
import {
  calculateBadgeProgress,
  getBadgeTemplates,
} from "../../services/badgeService";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function BadgeDebug() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { currentUser } = useAuth();

  const handleInitializeBadges = async () => {
    setLoading(true);
    setMessage("Inicjalizuję szablony odznak...");

    const success = await initializeBadgeTemplates();
    if (success) {
      setMessage("✅ Szablony odznak zostały utworzone!");
    } else {
      setMessage("❌ Błąd podczas tworzenia szablonów odznak");
    }
    setLoading(false);
  };

  const handleTestUserCounters = async () => {
    if (!currentUser) {
      setMessage("❌ Musisz być zalogowany");
      return;
    }

    setLoading(true);
    setMessage("Aktualizuję countery użytkownika...");

    try {
      const testCounters = getTestUserCounters();
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        counters: testCounters,
      });
      setMessage("✅ Countery użytkownika zostały zaktualizowane!");
    } catch (error) {
      console.error("Błąd:", error);
      setMessage("❌ Błąd podczas aktualizacji counters");
    }
    setLoading(false);
  };

  const handleTestBadgeProgress = async () => {
    if (!currentUser) {
      setMessage("❌ Musisz być zalogowany");
      return;
    }

    setLoading(true);
    setMessage("Testuję obliczenia postępu odznak...");

    try {
      const badgeTemplates = await getBadgeTemplates();
      const progress = calculateBadgeProgress(
        currentUser.counters || {},
        currentUser.earnedBadges || {},
        badgeTemplates,
      );

      setMessage(
        `✅ Obliczono postęp dla ${progress.length} odznak. Sprawdź konsolę.`,
      );
    } catch (error) {
      console.error("Błąd:", error);
      setMessage("❌ Błąd podczas obliczania postępu");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
        🧪 Debug Odznak
      </h2>

      <div className="space-y-4">
        <button
          onClick={handleInitializeBadges}
          disabled={loading}
          className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Inicjalizuj Szablony Odznak
        </button>

        <button
          onClick={handleTestUserCounters}
          disabled={loading || !currentUser}
          className="w-full rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          Ustaw Testowe Countery
        </button>

        <button
          onClick={handleTestBadgeProgress}
          disabled={loading || !currentUser}
          className="w-full rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
        >
          Testuj Obliczenia Postępu
        </button>

        {message && (
          <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <p className="text-gray-800 dark:text-gray-200">{message}</p>
          </div>
        )}

        {currentUser && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
              Aktualne Countery:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-300">
              {JSON.stringify(currentUser.counters || {}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
