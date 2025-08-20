import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Save, X, Edit3, RefreshCw, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountersEditor({ onCountersUpdate }) {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [counters, setCounters] = useState(
    currentUser?.counters || {
      totalActions: 0,
      totalChallenges: 0,
      recyclingActions: 0,
      educationActions: 0,
      savingActions: 0,
    },
  );
  const [loading, setLoading] = useState(false);

  // Aktualizuj stan counters gdy currentUser się zmieni
  useEffect(() => {
    if (currentUser?.counters) {
      setCounters(currentUser.counters);
    }
  }, [currentUser?.counters]);

  const counterLabels = {
    totalActions: "Łączne EkoDziałania",
    totalChallenges: "Łączne EkoWyzwania",
    recyclingActions: "Działania Recykling",
    educationActions: "Działania Edukacja",
    savingActions: "Działania Oszczędzanie",
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({ counters });
      setIsEditing(false);

      // Powiadom komponent rodzicielski o zmianie counters
      if (onCountersUpdate) {
        onCountersUpdate(counters);
      }
    } catch (error) {
      console.error("Error updating counters:", error);
      alert("Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCounters(
      currentUser?.counters || {
        totalActions: 0,
        totalChallenges: 0,
        recyclingActions: 0,
        educationActions: 0,
        savingActions: 0,
      },
    );
    setIsEditing(false);
  };

  const handleCounterChange = (key, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setCounters((prev) => ({ ...prev, [key]: numValue }));
  };

  const incrementCounter = (key) => {
    setCounters((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrementCounter = (key) => {
    setCounters((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Statystyki działań
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Edit3 className="h-4 w-4" />
            Edytuj
          </button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(counterLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>

            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit-controls"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => decrementCounter(key)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={counters[key]}
                      onChange={(e) => handleCounterChange(key, e.target.value)}
                      className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />

                    <button
                      onClick={() => incrementCounter(key)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.span
                    key="display"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-lg font-bold text-gray-800 dark:text-white"
                  >
                    {currentUser?.counters?.[key] || 0}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex gap-3"
        >
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Zapisywanie..." : "Zapisz"}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Anuluj
          </button>
        </motion.div>
      )}

      <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💡 <strong>Wskazówka:</strong> Te statystyki wpływają na postęp Twoich
          odznak. Zwiększaj je wykonując EkoDziałania i EkoWyzwania!
        </p>
      </div>
    </motion.div>
  );
}
