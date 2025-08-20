import { useState, useEffect } from "react";
import { Eye, RefreshCw, Database, FileText, Trophy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DatabaseViewer() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    ecoActions: [],
    challengeTemplates: [],
    badgeTemplates: [],
  });
  const [activeTab, setActiveTab] = useState("ecoActions");

  const tabs = [
    {
      id: "ecoActions",
      name: "EkoDziałania",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "challengeTemplates",
      name: "EkoWyzwania",
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "badgeTemplates",
      name: "Odznaki",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const newData = {};

      // Pobierz dane z każdej kolekcji
      for (const tab of tabs) {
        const collectionRef = collection(db, tab.id);
        const snapshot = await getDocs(collectionRef);
        newData[tab.id] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      setData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTabData = data[activeTab] || [];
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
            <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Przeglądarka bazy danych
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Podgląd zawartości kolekcji
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Odśwież
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            } `}
          >
            <tab.icon
              className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ""}`}
            />
            <span>{tab.name}</span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-600">
              {data[tab.id]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {activeTabData.length === 0 ? (
              <div
                className={`rounded-lg p-8 text-center ${activeTabInfo?.bgColor}`}
              >
                <Database
                  className={`mx-auto mb-4 h-12 w-12 ${activeTabInfo?.color} opacity-50`}
                />
                <h3 className={`mb-2 font-medium ${activeTabInfo?.color}`}>
                  Brak danych
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kolekcja {activeTabInfo?.name} jest pusta
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeTabData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {item.name || item.id}
                      </h3>
                      <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                        {item.id}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {item.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Kategoria:
                          </span>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.category}
                          </span>
                        </div>
                      )}

                      {item.counterToCheck && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Counter:
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            {item.counterToCheck}
                          </span>
                        </div>
                      )}

                      {item.counterToIncrement && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Increment:
                          </span>
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {item.counterToIncrement}
                          </span>
                        </div>
                      )}

                      {item.levels && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Poziomy ({item.levels.length}):
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.levels.map((level, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              >
                                LV{level.level}: {level.requiredCount}{" "}
                                {level.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
