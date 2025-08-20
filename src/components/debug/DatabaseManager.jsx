import { useState } from "react";
import {
  Database,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addEcoActionsToFirestore,
  addChallengeTemplatesToFirestore,
  clearCollection,
  ecoActionsData,
  challengeTemplatesData,
} from "../../data/ecoActionsData";
import {
  badgeTemplatesData,
  addBadgeTemplatesToFirestore,
  clearBadgeTemplates,
} from "../../data/badgeTemplates";

export default function DatabaseManager() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeOperation, setActiveOperation] = useState(null);

  const operations = [
    {
      id: "add-eco-actions",
      title: "Dodaj EkoDziałania",
      description: `Dodaje ${Object.keys(ecoActionsData || {}).length} EkoDziałań`,
      icon: Upload,
      color: "bg-green-500 hover:bg-green-600",
      action: addEcoActionsToFirestore,
    },
    {
      id: "add-challenge-templates",
      title: "Dodaj EkoWyzwania",
      description: `Dodaje ${Object.keys(challengeTemplatesData || {}).length} szablonów EkoWyzwań`,
      icon: Upload,
      color: "bg-blue-500 hover:bg-blue-600",
      action: addChallengeTemplatesToFirestore,
    },
    {
      id: "add-badge-templates",
      title: "Dodaj Odznaki",
      description: `Dodaje ${Object.keys(badgeTemplatesData || {}).length} szablonów odznak`,
      icon: Upload,
      color: "bg-purple-500 hover:bg-purple-600",
      action: addBadgeTemplatesToFirestore,
    },
    {
      id: "clear-eco-actions",
      title: "Usuń EkoDziałania",
      description: "Usuwa wszystkie EkoDziałania z bazy",
      icon: Trash2,
      color: "bg-red-500 hover:bg-red-600",
      action: () => clearCollection("ecoActions"),
      dangerous: true,
    },
    {
      id: "clear-challenge-templates",
      title: "Usuń EkoWyzwania",
      description: "Usuwa wszystkie szablony EkoWyzwań",
      icon: Trash2,
      color: "bg-red-500 hover:bg-red-600",
      action: () => clearCollection("challengeTemplates"),
      dangerous: true,
    },
    {
      id: "clear-badge-templates",
      title: "Usuń Odznaki",
      description: "Usuwa wszystkie szablony odznak",
      icon: Trash2,
      color: "bg-red-500 hover:bg-red-600",
      action: clearBadgeTemplates,
      dangerous: true,
    },
  ];

  const executeOperation = async (operation) => {
    if (operation.dangerous) {
      const confirmed = window.confirm(
        `Czy na pewno chcesz wykonać operację: ${operation.title}?\n\nTa operacja jest nieodwracalna!`,
      );
      if (!confirmed) return;
    }

    try {
      setLoading(true);
      setActiveOperation(operation.id);
      setResults([]);

      const operationResults = await operation.action();
      setResults(operationResults);
    } catch (error) {
      console.error(`Error executing ${operation.id}:`, error);
      setResults([`❌ Błąd: ${error.message}`]);
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
          <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Zarządzanie bazą danych
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Masowe operacje na danych aplikacji
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Uwaga - Funkcje deweloperskie
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Te funkcje są przeznaczone do rozwoju aplikacji. Operacje usuwania
              są nieodwracalne!
            </p>
          </div>
        </div>
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {operations.map((operation) => (
          <motion.button
            key={operation.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => executeOperation(operation)}
            disabled={loading}
            className={`relative overflow-hidden rounded-xl p-4 text-left text-white transition-all duration-200 ${operation.color} ${loading ? "cursor-not-allowed opacity-50" : "shadow-lg hover:shadow-xl"} ${operation.dangerous ? "ring-2 ring-red-200 dark:ring-red-800" : ""} `}
          >
            {/* Loading overlay */}
            {loading && activeOperation === operation.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <operation.icon className="mt-1 h-6 w-6" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{operation.title}</h3>
                <p className="mt-1 text-sm opacity-90">
                  {operation.description}
                </p>
                {operation.dangerous && (
                  <span className="mt-2 inline-block rounded-full bg-red-600 px-2 py-1 text-xs">
                    NIEBEZPIECZNE
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Wyniki operacji:
              </h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Wyczyść
              </button>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                >
                  {result.startsWith("✅") && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {result.startsWith("❌") && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {result.startsWith("🗑️") && (
                    <Trash2 className="h-4 w-4 text-orange-600" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    {result}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Preview */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">
            EkoDziłania
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            {Object.keys(ecoActionsData || {}).length} szablonów
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            EkoWyzwania
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {Object.keys(challengeTemplatesData || {}).length} szablonów
          </p>
        </div>

        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <h4 className="mb-2 font-medium text-purple-800 dark:text-purple-200">
            Odznaki
          </h4>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {Object.keys(badgeTemplatesData || {}).length} szablonów
          </p>
        </div>
      </div>
    </motion.div>
  );
}
